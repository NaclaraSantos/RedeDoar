// Declaracao global para imports de arquivos .jsx em projetos TypeScript.
declare module '*.jsx' {
  import type { ComponentType } from 'react'

  // Tipo generico para componentes JSX quando nao ha declaracao especifica.
  const Component: ComponentType<any>
  export default Component
}
