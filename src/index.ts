import { types } from '@babel/core'
import type { NodePath } from '@babel/traverse'

const SUPPORTED_REMAPPING_PREFIXES = ['@afterburnerhq/', '@dirigible/'];
const GRAALJS_JAVA_GLOBAL = 'Java';
const GRAALJS_JAVA_TYPE = 'type';

export default function declare(api) {
  return {
    name: 'babel-plugin-graaljs-imports',
    visitor: visitor(api.types),
  }
}

export const visitor = (t: typeof types) => ({
  ImportDeclaration(path: NodePath<any>) {
    const source: string = path.node.source.value
    const identifiers: string[] = path.node.specifiers.map((item) => item.local.name)

    if (!SUPPORTED_REMAPPING_PREFIXES.some((item) => source.startsWith(item))) return

    path.replaceWithMultiple(
      identifiers.map((item) =>
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(item),
            t.callExpression(
              t.memberExpression(
                t.identifier(GRAALJS_JAVA_GLOBAL),
                t.identifier(GRAALJS_JAVA_TYPE)
              ), [
              t.stringLiteral(`${removePrefixes(source)}.${item}`),
            ])
          ),
        ])
      )
    )
  },
})

function removePrefixes(source: string): string {
  let finalSource = source;
  for (const prefix of SUPPORTED_REMAPPING_PREFIXES) {
    finalSource = finalSource.replace(prefix, "");
  }
  return finalSource;
}