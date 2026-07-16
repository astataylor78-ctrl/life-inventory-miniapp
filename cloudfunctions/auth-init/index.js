const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const DEFAULT_CATEGORIES = [
  '食品饮料',
  '清洁用品',
  '个人护理',
  '护肤美妆',
  '纸品耗材',
  '厨房用品',
  '家用工具',
  '数码电器',
  '衣物鞋包',
  '其他',
]
const ok = (data) => ({ ok: true, data })
const fail = (message) => ({ ok: false, message })

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return fail('无法获取微信身份')
    const session = await db.runTransaction(async (transaction) => {
      const existing = await transaction
        .collection('users')
        .where({ openid: OPENID })
        .limit(1)
        .get()
      let userId = existing.data[0]?._id
      if (!userId) {
        const user = await transaction.collection('users').add({
          data: {
            openid: OPENID,
            nickname: '',
            avatar_url: '',
            created_at: db.serverDate(),
            updated_at: db.serverDate(),
          },
        })
        userId = user._id
      }
      const homes = await transaction
        .collection('households')
        .where({ owner_user_id: userId })
        .limit(1)
        .get()
      let household = homes.data[0]
      if (!household) {
        const home = await transaction.collection('households').add({
          data: {
            name: '我的家',
            owner_user_id: userId,
            created_at: db.serverDate(),
            updated_at: db.serverDate(),
          },
        })
        household = { _id: home._id, name: '我的家' }
      }
      const current = await transaction
        .collection('categories')
        .where({ household_id: household._id })
        .get()
      const existingNames = new Set(current.data.map((item) => item.name))
      for (const [sort_order, name] of DEFAULT_CATEGORIES.entries()) {
        if (!existingNames.has(name))
          await transaction.collection('categories').add({
            data: {
              household_id: household._id,
              name,
              icon: '',
              sort_order,
              is_active: true,
              created_at: db.serverDate(),
              updated_at: db.serverDate(),
            },
          })
      }
      return { userId, householdId: household._id, householdName: household.name }
    })
    return ok(session)
  } catch (error) {
    console.error(error)
    return fail('登录初始化失败，请稍后重试')
  }
}
