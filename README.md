# table-tag-editor

## Usage

```html
<textarea id="table-tag-editor"></textarea>

<script>
var tableTagEditor = new TableTagEditor(
    document.getElementById('table-tag-editor'),
    {
        "lang": "en",
        "appearance": "auto",
    }
);
</script>
```

## Options - 初期化オプション

| オプション | 型 | 既定値 | 説明 |
|-----------|-----|--------|------|
| `lang` | string | `"en"` | 言語 |
| `appearance` | string | `"auto"` | UIの見た目。`"dark"`（ダーク）、`"light"`（ライト）、`"auto"`（OSの設定に従う）のいずれか |


## 更新履歴 - Change log

### @tomk79/table-tag-editor v0.1.0 (リリース日未定)

- Initial Release.

## License

MIT License


## Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
