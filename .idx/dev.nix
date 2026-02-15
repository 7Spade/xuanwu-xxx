{ pkgs }: {
  # 使用穩定版本頻道
  channel = "stable-24.11";

  # 安裝必要的軟體包
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.git       # 版本控制
    pkgs.tree      # 用於產生地圖
  ];

  # 環境變數設定
  env = {
    # 設定全域 npm 路徑，避免權限問題
    NPM_CONFIG_PREFIX = "/home/user/.npm-global";
  };

  # Firebase 模擬器配置
  services.firebase.emulators = {
    detect = false;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };

  idx = {
    # VS Code 擴充套件
    extensions = [
      "esbenp.prettier-vscode"
      "dsznajder.es7-react-js-snippets"
    ];

    workspace = {
      # 僅在環境首次建立時執行
      onCreate = {
        setup-tools = ''
          # 1. 建立並配置 npm 全域目錄
          mkdir -p /home/user/.npm-global

          # 2. 開啟 Firebase 相關實驗性功能
          firebase experiments:enable webframeworks --force
          
          # 3. 安裝全域工具與 MCP 伺服器
          # 預先下載 Software-planning-mcp
          npx -y github:NightTrek/Software-planning-mcp --help
          
          # 安裝其他常規工具
          npm install -g shadcn@latest repomix @modelcontextprotocol/server-sequential-thinking next-devtools-mcp@latest @upstash/context7-mcp
          
          # 4. 安裝專案本地依賴
          npm install
        '';
        
        # 預設開啟的檔案
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };

      # 每次環境啟動時執行
      onStart = {
        initialize = ''
          # 每次啟動時產生地圖檔案供 AI 參考，排除不必要的目錄
          tree -I 'node_modules|.git|.next|.firebase|.npm-global' > PROJECT_STRUCTURE.md
        '';
      };
    };

    # 預覽設定
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}