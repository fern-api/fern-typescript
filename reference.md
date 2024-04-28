
## Snippets


<details><summary> <code>fern.snippets.<a href="./src/api/resources/snippets/client/Client.ts">get</a>({ ...params }) -> Fern.Snippet[]</code> </summary>

<dl>

<dd>

#### 📝 Description

<dl>

<dd>

<dl>

<dd>

Get snippet by endpoint method and path

</dd>

</dl>

</dd>

</dl>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await fern.snippets.get({
    endpoint: {
        method: Fern.EndpointMethod.Get,
        path: "/v1/search"
    }
});
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**request: `Fern.GetSnippetRequest`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Snippets.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>


<details><summary> <code>fern.snippets.<a href="./src/api/resources/snippets/client/Client.ts">load</a>({ ...params }) -> Fern.SnippetsPage</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await fern.snippets.load({
    page: 1,
    orgId: "vellum",
    apiId: "vellum-ai",
    sdks: [{
            type: "python",
            package: "vellum-ai",
            version: "1.2.1"
        }]
});
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**request: `Fern.ListSnippetsRequest`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Snippets.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>




## Templates



