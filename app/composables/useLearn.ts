/**
 * Learning articles composable
 * Manages article data fetched from the backend
 */

export interface Article {
  id: number
  title: string
  category: string
  content: string
  author: string
  publishedAt: string
  readTime: number
  views: number
}

export interface ArticleListItem {
  id: number
  title: string
  category: string
  author: string
  publishedAt: string
  readTime: number
  views: number
}

export function useLearn() {
  const articles = useState<ArticleListItem[]>('articles', () => [])
  const currentArticle = useState<Article | null>('current-article', () => null)
  const isLoading = useState('articles-loading', () => false)
  const error = useState<string | null>('articles-error', () => null)

  /**
   * Fetch article list from the backend
   * TODO: Replace with actual API call when backend is ready
   */
  const fetchArticles = async () => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<ArticleListItem[]>('/api/articles')

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))
      articles.value = [
        {
          id: 1,
          title: 'SQL 注入攻击入门指南',
          category: 'Web',
          author: 'admin',
          publishedAt: '2024-01-15',
          readTime: 10,
          views: 1256
        },
        {
          id: 2,
          title: '栈溢出漏洞利用基础',
          category: 'Pwn',
          author: 'pwner',
          publishedAt: '2024-01-20',
          readTime: 15,
          views: 892
        },
        {
          id: 3,
          title: 'RSA 加密算法原理与攻击',
          category: 'Crypto',
          author: 'crypto_master',
          publishedAt: '2024-01-18',
          readTime: 20,
          views: 1034
        },
        {
          id: 4,
          title: '逆向工程入门：静态分析技术',
          category: 'Reverse',
          author: 'reverser',
          publishedAt: '2024-01-22',
          readTime: 12,
          views: 756
        },
        {
          id: 5,
          title: '隐写术基础：图片隐写',
          category: 'Misc',
          author: 'misc_king',
          publishedAt: '2024-01-10',
          readTime: 8,
          views: 1489
        },
        {
          id: 6,
          title: '智能合约安全审计入门',
          category: 'Blockchain',
          author: 'blockchain_dev',
          publishedAt: '2024-02-01',
          readTime: 25,
          views: 423
        },
        {
          id: 7,
          title: 'XSS 跨站脚本攻击详解',
          category: 'Web',
          author: 'admin',
          publishedAt: '2024-01-25',
          readTime: 12,
          views: 1102
        },
        {
          id: 8,
          title: '堆利用技术进阶',
          category: 'Pwn',
          author: 'pwner',
          publishedAt: '2024-02-05',
          readTime: 30,
          views: 534
        },
        {
          id: 9,
          title: '椭圆曲线密码学基础',
          category: 'Crypto',
          author: 'crypto_master',
          publishedAt: '2024-01-28',
          readTime: 18,
          views: 678
        }
      ]
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取文章列表失败'
      articles.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single article detail from the backend
   * TODO: Replace with actual API call when backend is ready
   */
  const fetchArticle = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<Article>(`/api/articles/${id}`)

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))

      const mockContents: Record<number, string> = {
        1: `# SQL 注入攻击入门指南

> 这是一篇测试文章。

## 什么是 SQL 注入？

SQL 注入（SQL Injection）是一种常见的 Web 安全漏洞，攻击者可以通过在输入字段中插入恶意 SQL 代码来操纵数据库查询。

## 基本原理

当应用程序直接将用户输入拼接到 SQL 查询中时，就可能存在 SQL 注入漏洞：

\`\`\`sql
SELECT * FROM users WHERE username = '$username' AND password = '$password'
\`\`\`

如果攻击者输入 \`admin' --\`，查询会变成：

\`\`\`sql
SELECT * FROM users WHERE username = 'admin' --' AND password = ''
\`\`\`

## 常见攻击类型

### 1. 联合查询注入 (UNION-based)

\`\`\`sql
' UNION SELECT username, password FROM users --
\`\`\`

### 2. 布尔盲注 (Boolean-based Blind)

\`\`\`sql
' AND 1=1 --  (返回正常)
' AND 1=2 --  (返回异常)
\`\`\`

### 3. 时间盲注 (Time-based Blind)

\`\`\`sql
' AND SLEEP(5) --
\`\`\`

## 防御措施

1. **使用参数化查询**
2. **输入验证和过滤**
3. **最小权限原则**
4. **使用 WAF（Web 应用防火墙）**

## 实践练习

建议在合法的靶场环境中练习，如：
- DVWA
- SQLi-labs
- [Hack The Box](https://www.hackthebox.com/)`,
        2: `# 栈溢出漏洞利用基础

## 什么是栈溢出？

栈溢出（Stack Overflow）是一种内存安全漏洞，当程序向栈上的缓冲区写入超出其分配大小的数据时发生。

## 栈的结构

\`\`\`
高地址
+------------------+
|    返回地址       |
+------------------+
|    保存的 EBP    |
+------------------+
|    局部变量       |
+------------------+
|    缓冲区        |
+------------------+
低地址
\`\`\`

## 漏洞代码示例

\`\`\`c
#include <stdio.h>
#include <string.h>

void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // 危险！没有边界检查
}

int main(int argc, char *argv[]) {
    vulnerable(argv[1]);
    return 0;
}
\`\`\`

## 利用步骤

1. **确定偏移量** - 找到覆盖返回地址所需的字节数
2. **控制 EIP** - 用目标地址覆盖返回地址
3. **执行 Shellcode** - 跳转到恶意代码执行

## 现代保护机制

- **ASLR** - 地址空间布局随机化
- **Stack Canary** - 栈保护
- **NX/DEP** - 数据执行保护
- **PIE** - 位置无关可执行文件`,
        3: `# RSA 加密算法原理与攻击

## RSA 基本原理

RSA 是一种非对称加密算法，基于大整数分解的困难性。

### 密钥生成

1. 选择两个大素数 \`p\` 和 \`q\`
2. 计算 \`n = p × q\`
3. 计算欧拉函数 \`φ(n) = (p-1)(q-1)\`
4. 选择公钥指数 \`e\`，满足 \`gcd(e, φ(n)) = 1\`
5. 计算私钥指数 \`d\`，满足 \`e × d ≡ 1 (mod φ(n))\`

### 加密与解密

\`\`\`
加密: c = m^e mod n
解密: m = c^d mod n
\`\`\`

## 常见攻击方法

### 1. 小公钥指数攻击

当 \`e\` 很小（如 e=3）且明文也较小时：

\`\`\`python
import gmpy2
c = ...  # 密文
e = 3
m = gmpy2.iroot(c, e)[0]
\`\`\`

### 2. 共模攻击

当使用相同的 \`n\` 但不同的 \`e\` 加密相同明文时。

### 3. Wiener 攻击

当私钥 \`d\` 较小时，可通过连分数攻击恢复。

## Python 实现示例

\`\`\`python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

# 生成密钥对
key = RSA.generate(2048)
public_key = key.publickey()

# 加密
cipher = PKCS1_OAEP.new(public_key)
ciphertext = cipher.encrypt(b"Hello, RSA!")

# 解密
cipher = PKCS1_OAEP.new(key)
plaintext = cipher.decrypt(ciphertext)
\`\`\``
      }

      const articleInfo = articles.value.find(a => a.id === id)
      if (!articleInfo) {
        throw new Error('文章不存在')
      }

      currentArticle.value = {
        ...articleInfo,
        content: mockContents[id] || `# ${articleInfo.title}\n\n文章内容加载中...`
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取文章详情失败'
      currentArticle.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Get total article count
   */
  const totalArticles = computed(() => articles.value.length)

  /**
   * Get unique categories
   */
  const categories = computed(() => {
    const cats = new Set(articles.value.map(a => a.category))
    return Array.from(cats)
  })

  return {
    articles,
    currentArticle,
    isLoading,
    error,
    fetchArticles,
    fetchArticle,
    totalArticles,
    categories
  }
}
