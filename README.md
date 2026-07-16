# 生活物品管家

个人使用的微信小程序，用于记录家中的物品、分类、层级位置和库存数量。本分支完成 Milestone 1：微信云开发登录、默认家庭空间、分类/位置/物品 CRUD、图片上传和工程测试。

## 已实现范围

- 微信云开发免鉴权登录，首次登录事务内创建用户、“我的家”和 10 个默认分类
- 所有云函数从微信上下文获取 `openid`，并验证家庭空间所有权
- 分类新增、查看和安全停用
- 层级位置新增、查看和安全停用
- 物品新增、查看、编辑、搜索、排序和归档
- 每件物品最多上传 3 张云存储图片
- 数量以放大 1000 倍的整数存储；初始化或编辑库存时事务内写入库存流水
- 中文加载、空状态和错误状态

暂未实现库存快捷增减、补货清单、批次/保质期、订阅提醒、数据导出和数据清空。这些属于后续里程碑，当前没有占位功能冒充实现。

## 本地启动

要求 Node.js 20+、npm 和微信开发者工具。

```bash
npm install
npm run dev:mp-weixin
```

然后在微信开发者工具中导入 `dist/dev/mp-weixin`。首次导入后，在开发者工具的项目设置中填写你自己的小程序 AppID；仓库不会保存 AppID。

## 微信云开发配置

1. 在微信开发者工具中开通云开发并创建环境。
2. 创建以下数据库集合：
   - `users`
   - `households`
   - `categories`
   - `locations`
   - `items`
   - `inventory_transactions`
3. 将数据库集合权限设为“仅云函数可读写”。前端不直接访问数据库。
4. 分别右键 `cloudfunctions/auth-init`、`cloudfunctions/catalog`、`cloudfunctions/items`，选择“上传并部署：云端安装依赖”。
5. 在小程序“我的”页面输入云环境 ID。该值只保存在本机微信存储中，不会写入仓库。
6. 建议建立索引：
   - `users.openid`
   - `households.owner_user_id`
   - `categories.household_id + sort_order`
   - `locations.household_id + sort_order`
   - `items.household_id + is_archived + updated_at`
   - `inventory_transactions.household_id + item_id + created_at`

## 工程命令

```bash
npm run typecheck
npm run lint
npm run test
npm run build:mp-weixin
```

## 安全说明

- 不要提交 `project.private.config.json`、AppID、云环境 ID、openid 或真实个人数据。
- 家庭 ID 不由前端传入或信任；每个云函数都根据登录上下文解析所有者家庭空间。
- 物品库存变化在云函数事务内同时更新库存与流水，避免出现没有流水的库存变更。
- 物品、分类和位置使用归档/停用，避免破坏历史关联。

## 目录

```text
src/                 uni-app Vue 3 前端
  domain/            可独立测试的业务规则
  pages/             登录、首页、物品、分类、位置、设置
  services/          云函数与云存储调用
  stores/            Pinia 状态
cloudfunctions/      CloudBase 云函数
tests/               Vitest 单元测试
```
