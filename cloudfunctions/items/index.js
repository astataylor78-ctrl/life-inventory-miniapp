const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const ok = (data) => ({ ok: true, data })
const fail = (message) => ({ ok: false, message })
const isScaled = (value) => Number.isSafeInteger(value) && value >= 0
const mapItem = (row) => ({
  _id: row._id,
  name: row.name,
  brand: row.brand ?? null,
  imageUrls: row.image_urls || [],
  categoryId: row.category_id ?? null,
  locationId: row.location_id ?? null,
  quantityScaled: row.quantity_scaled,
  unit: row.unit,
  minQuantityScaled: row.min_quantity_scaled,
  targetQuantityScaled: row.target_quantity_scaled ?? null,
  note: row.note ?? null,
  isArchived: row.is_archived,
  updatedAt: row.updated_at,
})

async function household() {
  const { OPENID } = cloud.getWXContext()
  const user = (await db.collection('users').where({ openid: OPENID }).limit(1).get()).data[0]
  if (!user) throw new Error('请先登录')
  const home = (await db.collection('households').where({ owner_user_id: user._id }).limit(1).get())
    .data[0]
  if (!home) throw new Error('家庭空间不存在')
  return home._id
}
async function validateReference(collection, id, householdId) {
  if (!id) return
  const row = await db.collection(collection).doc(id).get()
  if (!row.data || row.data.household_id !== householdId || !row.data.is_active)
    throw new Error('分类或位置无效')
}
function validate(payload) {
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  if (!name || name.length > 50) throw new Error('物品名称长度应为 1–50 个字符')
  if (!isScaled(payload.quantityScaled) || !isScaled(payload.minQuantityScaled))
    throw new Error('库存数量无效')
  if (
    payload.targetQuantityScaled !== null &&
    (!isScaled(payload.targetQuantityScaled) ||
      payload.targetQuantityScaled < payload.minQuantityScaled)
  )
    throw new Error('目标库存不能低于安全库存')
  if (
    !Array.isArray(payload.imageUrls) ||
    payload.imageUrls.length > 3 ||
    !payload.imageUrls.every((x) => typeof x === 'string' && x.startsWith('cloud://'))
  )
    throw new Error('物品图片无效')
  if (typeof payload.note === 'string' && payload.note.length > 500)
    throw new Error('备注不能超过 500 字')
  return {
    name,
    brand: payload.brand || null,
    image_urls: payload.imageUrls,
    category_id: payload.categoryId || null,
    location_id: payload.locationId || null,
    quantity_scaled: payload.quantityScaled,
    unit:
      String(payload.unit || '个')
        .trim()
        .slice(0, 10) || '个',
    min_quantity_scaled: payload.minQuantityScaled,
    target_quantity_scaled: payload.targetQuantityScaled,
    note: payload.note || null,
  }
}

exports.main = async (event) => {
  try {
    const householdId = await household()
    const payload = event.payload || {}
    if (event.action === 'list') {
      const conditions = { household_id: householdId, is_archived: Boolean(payload.archived) }
      if (payload.categoryId) conditions.category_id = payload.categoryId
      if (payload.locationId) conditions.location_id = payload.locationId
      let query = db.collection('items').where(conditions)
      query =
        payload.sort === 'name'
          ? query.orderBy('name', 'asc')
          : payload.sort === 'quantity'
            ? query.orderBy('quantity_scaled', 'asc')
            : query.orderBy('updated_at', 'desc')
      let rows = (await query.limit(100).get()).data
      if (payload.keyword) {
        const keyword = String(payload.keyword).trim().toLocaleLowerCase()
        rows = rows.filter((row) =>
          [row.name, row.brand, row.note].some((value) =>
            String(value || '')
              .toLocaleLowerCase()
              .includes(keyword),
          ),
        )
      }
      return ok(rows.map(mapItem))
    }
    if (event.action === 'get') {
      const row = await db.collection('items').doc(payload.id).get()
      if (!row.data || row.data.household_id !== householdId) return fail('物品不存在')
      return ok(mapItem(row.data))
    }
    if (event.action === 'create' || event.action === 'update') {
      const data = validate(payload)
      await Promise.all([
        validateReference('categories', data.category_id, householdId),
        validateReference('locations', data.location_id, householdId),
      ])
      const saved = await db.runTransaction(async (transaction) => {
        if (event.action === 'create') {
          const result = await transaction.collection('items').add({
            data: {
              ...data,
              household_id: householdId,
              is_archived: false,
              created_at: db.serverDate(),
              updated_at: db.serverDate(),
            },
          })
          if (data.quantity_scaled !== 0)
            await transaction.collection('inventory_transactions').add({
              data: {
                household_id: householdId,
                item_id: result._id,
                batch_id: null,
                type: 'adjust',
                change_quantity_scaled: data.quantity_scaled,
                quantity_after_scaled: data.quantity_scaled,
                note: '初始库存',
                created_at: db.serverDate(),
              },
            })
          return { _id: result._id, ...data, is_archived: false }
        }
        const current = await transaction.collection('items').doc(payload._id).get()
        if (!current.data || current.data.household_id !== householdId)
          throw new Error('无权访问该物品')
        await transaction
          .collection('items')
          .doc(payload._id)
          .update({ data: { ...data, updated_at: db.serverDate() } })
        const change = data.quantity_scaled - current.data.quantity_scaled
        if (change)
          await transaction.collection('inventory_transactions').add({
            data: {
              household_id: householdId,
              item_id: payload._id,
              batch_id: null,
              type: 'adjust',
              change_quantity_scaled: change,
              quantity_after_scaled: data.quantity_scaled,
              note: '编辑物品库存',
              created_at: db.serverDate(),
            },
          })
        return { _id: payload._id, ...data, is_archived: current.data.is_archived }
      })
      return ok(mapItem(saved))
    }
    if (event.action === 'archive') {
      const row = await db.collection('items').doc(payload.id).get()
      if (!row.data || row.data.household_id !== householdId) return fail('无权访问该物品')
      await db
        .collection('items')
        .doc(payload.id)
        .update({ data: { is_archived: true, updated_at: db.serverDate() } })
      return ok(null)
    }
    return fail('不支持的操作')
  } catch (error) {
    console.error(error)
    return fail(error.message || '操作失败')
  }
}
