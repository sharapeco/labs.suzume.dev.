# Suzume Labs

Web技術の実験場

## コンセプト

これまでHTML手書きでインデックスを作っていたが、ファイルが増えてきて大変になってきたので自動化した。

これからはインデックスに登録したいHTML文書に title, description, keywords を設定し、ビルドするだけ。

デプロイも GitHub に push するだけで自動で行ってくれる。

## 使い方

### ローカル環境での確認

- 初めての場合は `npm install` で依存関係をインストールする
- `scripts/template.html` を参考にHTML文書を作成する
- `npm run build` でビルドする
- `npm start` でローカルサーバを立ち上げ、 `http://localhost:8080` にアクセスして確認する（ポート番号はコンソールから確認）

### Cloudflare Pages へのデプロイ

- Framework preset: none
- Build command: `npm run build`
- Build output: `html`
- Root directory:

Cloudflare Pages へは 25 MB までしかデプロイできないので、大きなリソースは別の場所に置く。
