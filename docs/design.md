# MVP設計

## 責務と操作

ブラウザだけで動く静的Webアプリ。単独役はキャラ別の発光/非発光ボタンで1タップ。高確は独立した状態ボタン。複合は組合せ選択後、発光未確認のまま保存可能。オールスターは数値不明とCZ確定を分けて保存。固定下部Undoで連続取消。非高確単独発光の確認は最近の入力または全履歴から行う。

点数は現在区間、主表示発光率は実戦累計。両者の集計範囲を画面で明示。CZで該当キャラだけ区間保存・初期化。STで全キャラ保存・初期化。実戦終了で編集を止め、実戦履歴から新規開始。削除・復元・CZ・ST・実戦終了は確認画面を設ける。単独役・状態・Undoは即時保存。

## 構成

- `index.html`, `style.css`：スマートフォン優先の3列コンパクトカード、大きなボタン、色と文字による識別。
- `app.js`：操作、保存、モーダル、JSON/CSV出力。ユーザー入力はHTMLにエスケープ。
- `rules.js`：DOM非依存の計算、再生、Undo、インポート検証。
- `tests/`：Node標準テスト。外部API・バックエンド・ログイン不要。

## スキーマ1

ルート：schemaVersion / machine / rulesVersion / sessions。
実戦：id / startedAt / endedAt / events。
イベント共通：id / timestamp（epoch ms）/ type / rulesVersion。
chance：characters / chanceType / illuminated（キャラ別 true,false,null）/ high（3キャラ独立）/ gameCount（任意の最後の総G入力値）/ context / origin / recordedMinimumPoints / pendingFacts。
state：character / enabled。cz：character / boundary / gameCount。st：gameCount。
resolve：target / result（no-cz または cz-or-unknown）。undo：target。games：value。

gameCountは各役の正確な成立Gではなく、最後に入力した任意の総ゲーム数のスナップショット。CZ率の分母として自動推定しない。timestampは操作時刻であり成立時刻との一致保証はない。減算量不明はJSON null、CSV unknown。

## 保存

LocalStorageの単一キー `kabaneri-medal-observations-v1`。変更候補を先に保存し、成功した時だけ画面状態へ反映。失敗時に正常保存と表示しない。壊れた保存は上書きせず、原文退避後に明示初期化。別タブの変更を検出したら書込みを止めて再読込を求める。

JSON復元は既存データの置換を確認。CSVは分析用、復元はJSON。端末・ブラウザ・URLが異なればデータを共有しない。プライベートモードやブラウザデータ削除後は保存の維持を保証できない。同期なし。

## 検証限界

計算とUIスクリプトの操作経路を自動検証する。Sites指定のcontrol-browserが利用できない環境では、ブラウザ実画面・タッチ操作・画面幅の目視検証は未実施として報告する。ホール実機での運用試験は未実施。
