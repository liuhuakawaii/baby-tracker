# Baby Tracker - 宝宝喂养记录

婴儿喂养/换尿裤记录 + AI 分析的 React Native app。

## 技术栈
- Expo SDK 56 + Expo Router v4 (文件路由)
- expo-sqlite (本地数据库)
- Zustand (状态管理)
- Lottie + react-native-reanimated (动画)
- TypeScript

## 命令
- `npx expo start` — 启动开发服务器（Expo Go 扫码调试）
- `npx expo start --ios` — iOS 模拟器启动
- `npx expo export --platform ios` — 构建验证

## 目录结构
```
app/                  # Expo Router 页面
├── _layout.tsx       # 根布局
├── (tabs)/           # Tab 导航
│   ├── index.tsx     # 时间线首页
│   ├── add.tsx       # 快速记录
│   └── settings.tsx  # 设置
├── baby/profile.tsx  # 婴儿信息编辑
└── analysis.tsx      # AI 分析
src/
├── constants/        # 主题色、类型定义
├── db/              # SQLite 数据库
└── stores/          # Zustand stores
```

## 数据库
SQLite 表：baby（婴儿信息）、records（喂养/尿裤记录）、settings（配置）

## AI 集成
OpenAI 兼容接口，默认 base_url: `https://token-plan-sgp.xiaomimimo.com/v1`

## 注意事项
- 依赖安装使用 `npm install --legacy-peer-deps`（Expo SDK 56 peer dep 冲突）
- iPhone 调试需安装 Expo Go，与电脑同 WiFi
