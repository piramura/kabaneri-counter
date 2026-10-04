# カバネリ実戦ポイントカウンター

**「パチスロ甲鉄城のカバネリ」（2022年・6.5号機・メダル機）の通常時専用カウンターです。**

チャンス目、発光、高確、CZ/STを記録し、観測から判断できる最低減算ポイントを表示します。スマートフォンの片手操作を優先した静的Webアプリで、GitHub Pagesで公開できます。スマスロ「海門決戦」は対象外です。

## GitHub Pagesで公開する

必要なのはGitHubアカウント、Git、Node.js 22以上です。無料プランではPublicリポジトリを使用してください。アプリにログイン・APIキー・サーバーDBは不要です。

### 1. 空のリポジトリを作成

GitHubで新しいリポジトリを作成します。名前は任意（例：`kabaneri-point-counter`）。**README・.gitignore・ライセンスの自動生成をせず、空の状態で作成**してください。

### 2. ソースをアップロード

配布ZIPを解凍し、`package.json` と `.github` がある `kabaneri-point-counter` フォルダで実行します。

```bash
npm test
npm run build

git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

`YOUR_USERNAME` と `YOUR_REPOSITORY` を実際のユーザー名・リポジトリ名に置き換えてください。依存パッケージがないため、`npm install` は不要です。GitHubの認証はGit Credential Managerなど、使用環境の方法で行ってください。

ZIPの外側のフォルダごとアップロードせず、リポジトリ直下に `README.md`、`package.json`、`dist/`、`.github/` が置かれる構成にします。`.github` は隠しフォルダなので、GUIによるアップロードで抜け落ちないようにしてください。上記のGit操作なら含まれます。

### 3. Pagesを有効化

リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に変更します。追加のワークフローテンプレートは不要です。

その後 **Actions → Deploy to GitHub Pages → Run workflow** から `main` を選んで実行してください。初回push時にPages未設定で失敗していても、この設定後に再実行すれば構いません。

テストが成功すると `dist/` が公開されます。公開URLはActionsのdeploy結果、またはSettings → Pagesで確認できます。通常は次の形式です。

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

以降は `main` へのpushで、テスト・配信ファイルの準備・公開が自動実行されます。ブランチ名を変更する場合は `.github/workflows/pages.yml` の `branches: [main]` も変更してください。

公開手順の根拠：[GitHub公式・カスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[公開元の設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 使い方

1. 無名・生駒・美馬の「発光」「非発光」をタップして単独チャンス目を記録します。
2. 対応キャラに「好機の帯」が出たら高確をON、終了したらOFFにします。3キャラ独立です。
3. 複合目は組合せを選んで記録します。発光を観測していない場合は「未確認」のまま保存できます。
4. CZを観測したら該当キャラのCZボタンで区間を保存します。他キャラのポイントは継続します。
5. ST当選で通常時区間を保存・初期化します。次のチャンス目入力はST終了後の通常時に行います。
6. 誤入力は画面下部のUndoで取り消せます。複数回の取消に対応しています。
7. 「実戦履歴」から新規実戦、保存済み実戦の閲覧、JSON/CSV出力、JSON復元、削除ができます。

表示ポイントは**現在区間の最低減算合計**、メインの発光率は**実戦累計の非高確・単独チャンス目**を対象とします。

## 計算上の注意

| 観測 | 記録する下限 |
| --- | --- |
| 非高確の単独・非発光 | 1pt |
| 非高確の単独・発光、CZ帰属未確認 | 1pt、確認待ち |
| 上記の発光がCZ非当選と確認できた場合 | 履歴から15ptに更新 |
| 対応高確の単独 | 発光にかかわらず15pt |
| 複合 | 各キャラ通常15pt・対応高確30pt |
| オールスター・無名/生駒 | 通常30pt・対応高確60pt |
| オールスター・美馬 | 減算量不明、CZ確定の事実を別記録 |

- 発光は「15pt以上減算」だけでなく「CZ到達」でも起きます。そのため非高確単独の発光を一律15ptとして加算しません。前兆確認後、履歴の「確認」からCZ非当選を確定できたものだけ更新します。
- ポイント合計は内部残りポイントやCZまでの残りではありません。CZ記録時点も内部当選時点を保証しません。
- CZ中・ST中・ボーナス中のチャンス目は入力対象外です。
- 「高確」は好機の帯を指します。ランプの点灯やチャンス目確率上昇状態とは別です。自動OFFにはなりません。
- 根拠と未確定事項は [解析ルール](docs/analysis-rules.md) に整理しています。

## 保存・移行

実戦データは使用ブラウザのLocalStorageに自動保存します。データをサーバーへ送信しません。公開されるのはアプリのコードで、実戦データではありません。

- **前のサイトからGitHub Pagesへ移行する場合：前のサイトでJSON出力 → 新しいサイトでJSON復元**してください。公開先のドメインが変わるため、自動移行はされません。
- JSONは元イベント・確認・取消を含むバックアップ形式です。復元すると現在のデータを置き換えます。
- CSVは分析用です。入力時の下限、現在のルールによる再計算値、取消後の有効フラグ、原始JSONを含みます。CSVからの復元には対応していません。
- ブラウザデータを削除すると保存データも消えます。端末やブラウザを変える場合もJSONで移行してください。
- 同じGitHubユーザーの複数のプロジェクトPagesは同じ `https://USER.github.io` オリジンを共有します。このアプリの保存キーも共通なので、同じオリジンに複数コピーを公開した場合は実戦データが共有されます。

## 開発・構成

```text
.github/workflows/pages.yml  テスト後にGitHub Pagesへ公開
scripts/build.mjs           解析ドキュメントを配信ファイルへ同期
dist/                       そのまま配信するHTML/CSS/JavaScript
docs/analysis-rules.md       解析根拠・URL・未確定事項の正本
docs/design.md              操作設計・イベントスキーマ
tests/                      計算と画面操作スクリプトのテスト
package.json                Node.jsのコマンド定義
```

```bash
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

ローカルでは `http://localhost:8000/` を開きます。`file://` によるHTMLの直開きはES Modulesと保存の制約があるため非対応です。

ポイント計算は `dist/rules.js` に分離しています。`RULES` を変更するとイベント履歴から再計算されます。解析ドキュメントを変更したら `npm run build` で配信版に反映してください。ページ内のファイル参照は相対パスで、GitHub Pagesのリポジトリ配下URLにも対応しています。

## 検証状況

計算・Undo・CZ/ST区切り・発光の確認による再計算・保存/再読込・保存失敗・別タブ変更を含む自動テスト15件。画面操作テストはDOM APIハーネスであり、実ブラウザやスマートフォン実機の表示・タッチ操作を保証するものではありません。GitHub Actionsによる実際の公開はリポジトリ作成後に確認します。

本ツールはメーカー公式ではありません。設定推測・期待値計算は実装していません。
