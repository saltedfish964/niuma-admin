# 支持的 Markdown 语法例子

此页面的效果就是 MarkdownRender 组件的实际展示效果。

## 标题

**输入**

```md
# 一级标题 8-)

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

**输出**

# 一级标题 8-)

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 水平分隔线

**输入**

```md
---
```

**输出**

---

## 图片

图片必须放在 `public` 文件夹下。

**输入**

```md
![](/vite.svg)
```

**输出**

![](/vite.svg)

## 加粗 / 斜体 / 删除线

**输入**

```md
**这是加粗文本**

_这是斜体文本_

~~这是删除线文本~~
```

**输出**

**这是加粗文本**

_这是斜体文本_

~~这是删除线文本~~

## 引用

**输入**

```md
> 引用可以嵌套
>
> > 第二层
> >
> > > 第三层
```

**输出**

> 引用可以嵌套
>
> > 第二层
> >
> > > 第三层

## 无序列表

**输入**

```md
- 8 点起床
- 去商场买东西
  - 物品清单：
    - 一个芒果
    * 一个西瓜
    - 一箱牛奶
- 11 点煮饭
```

**输出**

- 8 点起床
- 去商场买东西
  - 物品清单：
    - 一个芒果
    * 一个西瓜
    - 一箱牛奶
- 11 点煮饭

## 有序列表

**输入**

```md
1. 8 点起床
2. 去商场买东西
3. 11 点煮饭
```

**输出**

1. 8 点起床
2. 去商场买东西
3. 11 点煮饭

## 外部链接

外部链接带有 `target="_blank" rel="noreferrer"`：

**输入**

```md
[Niuma Admin 官方文档](https://niuma-admin-doc.salted-fish.top/)
```

**输出**

[Niuma Admin 官方文档](https://niuma-admin-doc.salted-fish.top/)

## GitHub 风格的表格

**输入**

```

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

```

**输出**

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## Emoji 支持 :tada:

**输入**

```
:tada: :100:
```

**输出**

:tada: :100:

这里可以找到[所有支持的 emoji 列表](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs)。

## 自定义容器 {#custom-containers}

自定义容器可以通过它们的类型、标题和内容来定义。

### 默认标题 {#default-title}

**输入**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**输出**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

### 自定义标题 {#custom-title}

可以通过在容器的 "type" 之后附加文本来设置自定义标题。

**输入**

````md
::: danger STOP
危险区域，请勿继续
:::

::: details 点我查看代码

```js
console.log('Hello, VitePress!');
```

:::
````

**输出**

::: danger STOP
危险区域，请勿继续
:::

::: details 点我查看代码

```js
console.log('Hello, VitePress!');
```

:::

## GitHub 风格的警报

支持以标注的方式渲染 [GitHub 风格的警报](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)。

```md
> [!NOTE]
> 强调用户在快速浏览文档时也不应忽略的重要信息。

> [!TIP]
> 有助于用户更顺利达成目标的建议性信息。

> [!IMPORTANT]
> 对用户达成目标至关重要的信息。

> [!WARNING]
> 因为可能存在风险，所以需要用户立即关注的关键内容。

> [!CAUTION]
> 行为可能带来的负面影响。
```

> [!NOTE]
> 强调用户在快速浏览文档时也不应忽略的重要信息。

> [!TIP]
> 有助于用户更顺利达成目标的建议性信息。

> [!IMPORTANT]
> 对用户达成目标至关重要的信息。

> [!WARNING]
> 因为可能存在风险，所以需要用户立即关注的关键内容。

> [!CAUTION]
> 行为可能带来的负面影响。

## 代码块中的语法高亮

使用 [Shiki](https://github.com/shikijs/shiki) 在 Markdown 代码块中使用彩色文本实现语法高亮。Shiki 支持多种编程语言。需要做的就是将有效的语言别名附加到代码块的开头：

**输入**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**输出**

```js
export default {
  name: 'MyComponent',
  // ...
};
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
</ul>
```

在 Shiki 的代码仓库中，可以找到[合法的编程语言列表](https://shiki.style/languages)。

## 在代码块中实现行高亮

**输入**

````
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

除了单行之外，还可以指定多个单行、多行，或两者均指定：

- 多行：例如 `{5-8}`、`{3-10}`、`{10-17}`
- 多个单行：例如 `{4,7,9}`
- 多行与单行：例如 `{4,7-13,16,23-27,40}`

**输入**

````
```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum'
    }
  }
}
```
````

**输出**

```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum',
    }
  }
}
```

也可以使用 `// [!code highlight]` 注释实现行高亮。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Highlighted!' // [!!code highlight]
    }
  }
}
```
````

**输出**

```js
export default {
  data() {
    return {
      msg: 'Highlighted!', // [!code highlight]
    };
  },
};
```

## 代码块中聚焦

在某一行上添加 `// [!code focus]` 注释将聚焦它并模糊代码的其他部分。

此外，可以使用 `// [!code focus:<lines>]` 定义要聚焦的行数。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!!code focus]
    }
  }
}
```
````

**输出**

```js
export default {
  data() {
    return {
      msg: 'Focused!', // [!code focus]
    };
  },
};
```

## 代码块中的颜色差异

在某一行添加 `// [!code --]` 或 `// [!code ++]` 注释将会为该行创建 diff，同时保留代码块的颜色。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!!code --]
      msg: 'Added' // [!!code ++]
    }
  }
}
```
````

**输出**

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```

## 高亮“错误”和“警告” {#errors-and-warnings-in-code-blocks}

在某一行添加 `// [!code warning]` 或 `// [!code error]` 注释将会为该行相应的着色。

**输入**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Warning' // [!!code warning]
    }
  }
}
```
````

**输出**

```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning', // [!code warning]
    };
  },
};
```

## 行号

可以在代码块中添加 `:line-numbers` / `:no-line-numbers` 标记来覆盖在配置中的设置。

还可以通过在 `:line-numbers` 之后添加 `=` 来自定义起始行号，例如 `:line-numbers=2` 表示代码块中的行号从 2 开始。

**输入**

````md
```ts :no-line-numbers {1}
// 禁用行号
const line2 = 'This is line 2';
const line3 = 'This is line 3';
```

```ts {1}
// 默认启用行号
const line2 = 'This is line 2';
const line3 = 'This is line 3';
```

```ts:line-numbers=2 {1}
// 行号已启用，并从 2 开始
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**输出**

```ts
// 默认启用行号
const line2 = 'This is line 2';
const line3 = 'This is line 3';
```

```ts:line-numbers=2
// 行号已启用，并从 2 开始
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```

```ts :no-line-numbers
//  禁用行号
const line2 = 'This is line 2';
const line3 = 'This is line 3';
```

## 代码组

可以像这样对多个代码块进行分组：

**输入**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
};

export default config;
```

```ts [config.ts]
import type { UserConfig } from 'vitepress';

const config: UserConfig = {
  // ...
};

export default config;
```

:::
````

**输出**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
};

export default config;
```

```ts [config.ts]
import type { UserConfig } from 'vitepress';

const config: UserConfig = {
  // ...
};

export default config;
```

:::

## 数学方程

**输入**

```md
When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |
```

**输出**

When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |
