# Logic Overview 版本比較分析

分析對象：`logic-overview.v0.md` / `logic-overview.v3.md` / `logic-overview_v3.1.md`

---

## 結論速覽

| 版本 | 完成度 | 實現難度 | 綜合建議 |
|------|--------|----------|----------|
| v0   | 低 | 低（但有未修補漏洞） | 不建議，設計有已知缺陷 |
| v3   | 高 | 低（現有程式碼已大量實作） | **推薦作為當前開發基準** |
| v3.1 (v4 VSA) | 最高 | 高（需重構至 VS0–VS9） | 長期目標，短期成本高 |

**最高完成度：v3.1.md（Logic Overview v4）**
**最低實現難度：v3.md（現有程式碼最接近此設計）**

---

## 逐版分析

### logic-overview.v0.md

**完成度：低**

- 不變量 15 條（#1–#15），比 v3/v3.1 少 3 條（缺 #16 Talent Repository、#17 centralized-tag、#18 workspace-governance）
- A11 明確記載「雙重排程漏洞未修補」，旗標 `eligible` 的生命週期為開放性缺陷
- 缺少 `INTEGRATION_EVENT_ROUTER`：Projection 直接由兩條 Event Bus 驅動，單一寫入路徑不存在
- 缺少 `UNIFIED_COMMAND_GATEWAY` 與 `UNIVERSAL_AUTHORITY_INTERCEPTOR`
- `CENTRALIZED_TAG_AGGREGATE` 不在 Shared Kernel 內，`TALENT_REPOSITORY` 未建模
- `WORKSPACE_GOVERNANCE` 仍含 `WORKSPACE_MEMBER`（後續版本已移除，職責歸還至 Organization Layer）
- 組織治理命名用 `organization-governance.*`，與實際程式碼切片名稱 `account-organization.*` 不符
- `WORKSPACE_ORG_POLICY_CACHE` 作為 policy 同步的臨時構件仍存在，後續版本移除

**實現難度：低（但有偽低的陷阱）**

架構節點較少，乍看簡單。但 A11 的雙重排班漏洞未處理，`eligible` 生命週期若不補齊，排班功能無法正確運作，等同需要額外設計工作，實際難度並未省略，只是延後。

---

### logic-overview.v3.md

**完成度：高**

- 不變量 18 條（+#16 Talent Repository、+#17 centralized-tag 唯一性、+#18 workspace-governance = 策略執行層）
- `INTEGRATION_EVENT_ROUTER` 明確定義，Projection 寫入有唯一路徑（Invariant #9 強化）
- `UNIFIED_COMMAND_GATEWAY` + `UNIVERSAL_AUTHORITY_INTERCEPTOR` 補齊指令入口與權限攔截
- `CENTRALIZED_TAG_AGGREGATE` 納入 `SHARED_KERNEL`，`TALENT_REPOSITORY` 亦在 Shared Kernel 建模
- 組織治理命名修正為 `account-organization.*`，與程式碼切片一致
- `ORGANIZATION_POLICY` 明確發射 `PolicyChanged → AuthoritySnapshot`，移除了 `WORKSPACE_ORG_POLICY_CACHE`
- A11 描述為「eligible 生命週期（待補）」，問題已定義清楚，程式碼端已有 `updateOrgMemberEligibility` 實作

**待補項目：**

- eligible 生命週期仍有「（待補）」標記（`completed / cancelled → true` 尚未完整建模）
- Scheduling Saga（`ScheduleAssignRejected` / `ScheduleProposalCancelled`）僅在 A5 描述，圖中無獨立節點
- Account Event Bus 未顯式建模為子圖

**實現難度：低**

現有程式碼已大量對應此版本：`INTEGRATION_EVENT_ROUTER` 已實作、`eligible` 旗標已在 `registerOrganizationFunnel` 更新、`ScheduleAssignedPayload` 含 `orgId`。不需大幅重構，只需補齊少數待補項目。

---

### logic-overview_v3.1.md（標題：Logic Overview v4 — VSA）

**完成度：最高**

- 採用 **Vertical Feature Slice Architecture（VS0–VS9）**，每個切片有獨立的 Command → Domain → Event → Projection 閉環
- 18 條不變量 + 11 條原子邊界決策全部在圖尾完整列出，且各節點標記對應編號（如 `#A8 1cmd/1agg`、`#14 只讀 eligible=true`）
- `VS6 Scheduling Slice` 含顯式 `SCHEDULE_SAGA`（ScheduleAssignRejected / ScheduleProposalCancelled），補足 v3.md 的缺口
- `VS7 Notification Slice` 獨立子圖，三層架構（觸發→路由→交付）邊界清晰
- `VS8 Projection Bus` 將 `INTEGRATION_EVENT_ROUTER` 納入子圖，明確定義為單一寫入路徑
- `APPLICATION GATEWAY` 獨立子圖（`UNIFIED_COMMAND_GATEWAY` + `UNIVERSAL_AUTHORITY_INTERCEPTOR`），跨切片協調職責分離
- `VS2 Account Slice` 顯式建模 `ACC_EVENT_BUS`（AccountCreated / RoleChanged / PolicyChanged）
- `VS4` 的 `TALENT_REPO` 使用正確的 `account-organization.*` 命名並標記 #16
- 有 frontmatter（`title: Logic Overview v4`），是唯一格式完整的 Markdown 文件

**實現難度：高**

需要完成以下尚未存在於現有程式碼的工作：

| 新增構件 | 說明 |
|----------|------|
| `VS6_SAGA / SCHEDULE_SAGA` | 補償事件路徑需要新的 Saga Handler |
| `APPLICATION GATEWAY` subgraph | 需獨立出 unified-command-gateway 模組 |
| `ACC_EVENT_BUS` (VS2) | Account 層事件總線需顯式建模與路由 |
| VS0–VS9 整體切片邊界重構 | 現有程式碼需對應至各 VS 子圖，部分模組需移動 |

整體重構成本高，適合作為下一階段重設計的目標，而非立即實作對象。

---

## 選擇建議

**當前開發週期（短期）：以 v3.md 為基準**

- 完成度已足夠覆蓋所有 18 條不變量與核心架構
- 現有程式碼已大量實作，實現成本最低
- 待補項目明確（eligible 完整生命週期、Scheduling Saga 節點化）

**下一階段（中期）：以 v3.1.md 為重構目標**

- 當 Scheduling Saga、Account Event Bus、Application Gateway 需要正式落地時
- VS0–VS9 切片邊界可指導切片重命名與模組邊界調整
- eligible 生命週期（`completed / cancelled → true`）實作完成後，v3.1.md 的完整度優勢更為明顯
