import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
    {
        // 添加自定义规则配置
        rules: {
            // 禁用any类型检查
            '@typescript-eslint/no-explicit-any': 'off',
            // 允许隐式any（如函数参数未标注类型）
            '@typescript-eslint/explicit-function-return-type': 'off',
            // img
            "@next/next/no-img-element": "off"
        }
    },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
