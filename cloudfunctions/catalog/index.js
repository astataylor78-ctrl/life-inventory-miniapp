const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const ok = (data) => ({ ok: true, data })
const fail = (message) => ({ ok: false, message })
const cleanName = (value) => (typeof value === 'string' ? value.trim() : '')

async function ownedHousehold() {
  const { OPENID } = cloud.getWXContext()
  const users = await db.collection('users').where({ openid: OPENID }).limit(1).get()
  if (!users.data[0]) throw new Error('请先登录')
  const homes = await db
    .collection('households')
    .where({ owner_user_id: users.data[0]._id })
    .limit(1)
    .get()
  if (!homes.data[0]) throw new Error('家庭空间不存在')
  return homes.data[0]._id
}

exports.main = async (event) => {
  try {
    const householdId = await ownedHousehold()
    const collection =
      event.resource === 'category'
        ? 'categories'
        : event.resource === 'location'
          ? 'locations'
          : ''
    if (!collection) return fail('不支持的资源')
    const payload = event.payload || {}
    if (event.action === 'list') {
      const result = await db
        .collection(collection)
        .where({ household_id: householdId })
        .orderBy('sort_order', 'asc')
        .get()
      return ok(
        result.data.map((row) => ({
          _id: row._id,
          name: row.name,
          icon: row.icon,
          parentId: row.parent_id ?? null,
          sortOrder: row.sort_order,
          isActive: row.is_active,
        })),
      )
    }
    if (event.action === 'save') {
      const name = cleanName(payload.name)
      if (!name || name.length > 50) return fail('名称长度应为 1–50 个字符')
      if (collection === 'locations' && payload.parentId) {
        const parent = await db.collection('locations').doc(payload.parentId).get()
        if (!parent.data || parent.data.household_id !== householdId || !parent.data.is_active)
          return fail('上级位置无效')
        if (payload._id === payload.parentId) return fail('位置不能以自身为上级')
        let ancestorId = parent.data.parent_id
        let depth = 0
        while (ancestorId && depth < 20) {
          if (ancestorId === payload._id) return fail('不能移动到自己的子位置下')
          const ancestor = await db.collection('locations').doc(ancestorId).get()
          if (!ancestor.data || ancestor.data.household_id !== householdId) break
          ancestorId = ancestor.data.parent_id
          depth += 1
        }
      }
      const data = { name, updated_at: db.serverDate() }
      if (collection === 'locations') data.parent_id = payload.parentId || null
      if (payload._id) {
        const current = await db.collection(collection).doc(payload._id).get()
        if (!current.data || current.data.household_id !== householdId)
          return fail('无权访问该数据')
        await db.collection(collection).doc(payload._id).update({ data })
        return ok({
          _id: payload._id,
          name,
          parentId: data.parent_id,
          isActive: current.data.is_active,
          sortOrder: current.data.sort_order,
        })
      }
      const count = await db.collection(collection).where({ household_id: householdId }).count()
      const result = await db.collection(collection).add({
        data: {
          ...data,
          household_id: householdId,
          sort_order: count.total,
          is_active: true,
          created_at: db.serverDate(),
        },
      })
      return ok({
        _id: result._id,
        name,
        parentId: data.parent_id,
        isActive: true,
        sortOrder: count.total,
      })
    }
    if (event.action === 'disable') {
      const current = await db.collection(collection).doc(payload.id).get()
      if (!current.data || current.data.household_id !== householdId) return fail('无权访问该数据')
      if (collection === 'locations') {
        const children = await db
          .collection('locations')
          .where({ household_id: householdId, parent_id: payload.id, is_active: true })
          .count()
        if (children.total) return fail('存在子位置，不能停用')
      }
      const field = collection === 'categories' ? 'category_id' : 'location_id'
      const used = await db
        .collection('items')
        .where({ household_id: householdId, [field]: payload.id, is_archived: false })
        .count()
      if (used.total) return fail('仍有物品使用该项，不能停用')
      await db
        .collection(collection)
        .doc(payload.id)
        .update({ data: { is_active: false, updated_at: db.serverDate() } })
      return ok(null)
    }
    return fail('不支持的操作')
  } catch (error) {
    console.error(error)
    return fail(error.message || '操作失败')
  }
}
