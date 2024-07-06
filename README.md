# nestjs-mongoose-ref-issue-reproduction

This repository is a reproduction of an issue I am facing with [`@nestjs/mongoose`][nestjs_mongoose], where when using a [dynamic ref][mongoose_dynamic_ref] in a (NestJS Mongoose) schema, the `ref` function appears to be resolved at the time the schema is created, instead of at runtime.

In this reproduction, I am using a dynamic `ref` inside an [array of embedded discriminators][mongoose_array_embedded_discriminator]. This is so that I can define various article section types that can be embedded inside an article document.

This is an excerpt from `src/article/article-section.schema.ts` using  [`@nestjs/mongoose`][nestjs_mongoose] demonstrating the value of `this` inside the `ref` function:

```typescript
@Prop({
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref() {
        console.log(this); // => {
                           // =>   type: [Function: SchemaObjectId] {
                           // =>     schemaName: 'ObjectId',
                           // =>     defaultOptions: {},
                           // =>     get: [Function (anonymous)],
                           // =>     set: [Function: set],
                           // =>     setters: [],
                           // =>     _checkRequired: [Function (anonymous)],
                           // =>     _cast: [Function: castObjectId],
                           // =>     cast: [Function: cast],
                           // =>     _defaultCaster: [Function (anonymous)],
                           // =>     checkRequired: [Function (anonymous)]
                           // =>   },
                           // =>   ref: [Function: ref]
                           // => }
        return this.embedType;
      },
    },
  ],
  required: true,
})
```

In a regular Mongoose schema, the `ref` function would be resolved at runtime, allowing for dynamic references.

## Proof of work

This repository adopts the regular NestJS structure for separation of concerns, with the following structure:

- The files `<module>/<module>.schema.ts` contain regular NestJS Mongoose schema definitions.
- The files `<module>/<module>.model.ts` contain plain Mongoose schema & model definitions.

Two E2E tests, running the same `test/run-mongoose-tests.ts` assertions verify that the issue is present in the NestJS Mongoose schema, but not in the plain Mongoose schema:

- NestJS Mongoose: `test/nestjs-mongoose.e2e-spec.ts`
- Plain Mongoose: `test/mongoose.e2e-spec.ts`

Set up the project by running `npm install` and then `npm run test:e2e` to run the tests.

**Note**: This repository uses [Mongo Memory Server][mongo_memory_server] to run the tests (and provide a throwaway database environment for running the application). I have experienced issues getting it running on [NixOS][nixos] in the past.

To verify that the issue doesn't just exist in the test environment, I have also replicated the issue in the application itself. Run `npm run start:dev` to start the dev server, and then fetch `http://localhost:4200` to see the following (invalid) response:

```json
{
  "_id": "6688ab3f9d5e834ea10f9d37",
  "name": "Abstergo tergum distinctio convoco amet.",
  "author": "6688ab3f9d5e834ea10f9d25",
  "sections": [
    {
      "type": "text",
      "content": "Curvo argentum arbustum. Tersus magnam anser conduco stabilis vix ago aedificium vindico cuppedia. Utor ubi calcar tenus absum vinitor solvo canto."
    },
    {
      "type": "embed",
      "embeds": [],
      "embedType": "Author"
    },
    {
      "type": "image",
      "uri": "https://picsum.photos/seed/yAvxSQIGk/640/480",
      "credits": "Stips velum vulariter. Desidero tabgo delibero aedificium conculco velut caritas. Defaeco clam valens verumtamen velociter velociter."
    },
    {
      "type": "embed",
      "embeds": [],
      "embedType": "Spotlight"
    }
  ],
  "__v": 0
}
```

## Workaround

Fortunately there is a workaround, demonstrated in the [`workaround` branch][workaround_branch] where we use the NestJS Mongoose schema to define the discriminator, and then use a plain Mongoose schema to define the embedded discriminator:

```diff
 ArticleSectionSchema.discriminator(
   ArticleSectionType.Embed,
-  ArticleEmbedSectionSchema,
+  new mongoose.Schema({
+    embeds: {
+      type: [
+        {
+          type: mongoose.Schema.Types.ObjectId,
+          ref() {
+            return this.embedType;
+          },
+        },
+      ],
+      required: true,
+    },
+    embedType: {
+      type: String,
+      required: true,
+      enum: ['Author', 'Article', 'Post', 'Comment', 'Spotlight'],
+    },
+  }),
 );
```

The expected output for the application is:

```json

{
  "_id": "6688a3cb4e3fa6c920bc88fc",
  "name": "Textor utilis baiulus tergeo.",
  "author": "6688a3cb4e3fa6c920bc88e8",
  "sections": [
    {
      "type": "text",
      "content": "Administratio pecco suasoria. Creptio vulgaris caste denuo vel advoco utique aegre vomer. Cura xiphias vir suffragium sint.",
      "_id": "6688a3cb4e3fa6c920bc88fd"
    },
    {
      "type": "embed",
      "embeds": [
        {
          "_id": "6688a3cb4e3fa6c920bc88e6",
          "name": "Luke Koch-Aufderhar",
          "description": "aid junkie  🧙🏿",
          "__v": 0
        },
        {
          "_id": "6688a3cb4e3fa6c920bc88e7",
          "name": "Jeffery Braun Sr.",
          "description": "teacher junkie, scientist",
          "__v": 0
        }
      ],
      "embedType": "Author",
      "_id": "6688a3cb4e3fa6c920bc88fe"
    },
    {
      "type": "image",
      "uri": "https://picsum.photos/seed/LGbnTd/640/480",
      "credits": "Utor infit capio autem caveo sufficio. Pecto asporto circumvenio decens arcesso qui sursum. Crustulum cedo aperio ubi alius.",
      "_id": "6688a3cb4e3fa6c920bc88ff"
    },
    {
      "type": "embed",
      "embeds": [
        {
          "_id": "6688a3cb4e3fa6c920bc88f8",
          "docs": [
            "6688a3cb4e3fa6c920bc88ec",
            "6688a3cb4e3fa6c920bc88ee"
          ],
          "docsModel": "Article",
          "__v": 0
        },
        {
          "_id": "6688a3cb4e3fa6c920bc88f9",
          "docs": [
            "6688a3cb4e3fa6c920bc88f2",
            "6688a3cb4e3fa6c920bc88f3",
            "6688a3cb4e3fa6c920bc88f4"
          ],
          "docsModel": "Post",
          "__v": 0
        }
      ],
      "embedType": "Spotlight",
      "_id": "6688a3cb4e3fa6c920bc8900"
    }
  ],
  "__v": 0
}
```

See how the embeds are populated instead?

[mongoose_array_embedded_discriminator]: https://mongoosejs.com/docs/discriminators.html#embedded-discriminators-in-arrays
[mongoose_dynamic_ref]: https://mongoosejs.com/docs/populate.html#dynamic-ref
[mongo_memory_server]: https://github.com/nodkz/mongodb-memory-server
[nestjs_mongoose]: https://github.com/nestjs/mongoose
[nixos]: https://nixos.org
[workaround_branch]: https://github.com/kiyui/nestjs-mongoose-ref-issue-reproduction/tree/workaround
