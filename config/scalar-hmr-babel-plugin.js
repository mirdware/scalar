module.exports = function scalarHmrPlugin({ types: t, template }) {
  const buildDispatch = template(`
    if (module.hot) {
      module.hot.accept(function(err) { if (err) console.error('[HMR]', err); });
      module.hot.dispose(function(data) { data._old = EXPORT_REF; });
      if (module.hot.data && module.hot.data._old) {
        window.dispatchEvent(new CustomEvent('scalar-hmr-update', {
          detail: { _old: module.hot.data._old, _new: EXPORT_REF }
        }));
      }
    }
  `);
  const buildAccept = template(`if (module.hot) module.hot.accept();`);

  return {
    visitor: {
      Program: {
        enter(path) {
          path.traverse({
            ClassProperty(memberPath) {
              const { node } = memberPath;
              if (node.static) return;
              if (!t.isArrowFunctionExpression(node.value) && !t.isFunctionExpression(node.value)) return;
              const keyName = node.key.name || node.key.value;
              if (!keyName || keyName.startsWith('_') || keyName.startsWith('$')) return;
              const fn = node.value;
              const body = t.isBlockStatement(fn.body)
                ? fn.body
                : t.blockStatement([t.returnStatement(fn.body)]);
              memberPath.replaceWith(
                t.classMethod('method', node.key, fn.params, body, node.computed, false)
              );
            }
          });
        },
        exit(path) {
          let exportRef;
          const defaultExportPath = path.get('body').find(
            p => p.node.type === 'ExportDefaultDeclaration'
          );
          if (defaultExportPath) {
            const decl = defaultExportPath.node.declaration;
            if (decl.id) {
              exportRef = decl.id;
              defaultExportPath.replaceWithMultiple([
                decl,
                t.exportDefaultDeclaration(t.cloneNode(decl.id))
              ]);
            } else {
              const uid = path.scope.generateUidIdentifier('hmrExport');
              defaultExportPath.replaceWithMultiple([
                t.variableDeclaration('var', [t.variableDeclarator(uid, decl)]),
                t.exportDefaultDeclaration(t.cloneNode(uid))
              ]);
              exportRef = uid;
            }
          } else {
            for (const p of path.get('body')) {
              if (p.node.type !== 'ExportNamedDeclaration') continue;
              if (p.node.source) continue; // re-export: export { x } from './other'
              const specifier = p.node.specifiers?.find(s => s.exported?.name === 'default');
              if (specifier) { exportRef = specifier.local; break; }
            }
          }
          if (!exportRef) {
            path.pushContainer('body', buildAccept());
            return;
          }
          path.pushContainer('body', buildDispatch({ EXPORT_REF: t.cloneNode(exportRef) }));
        }
      }
    }
  };
};
