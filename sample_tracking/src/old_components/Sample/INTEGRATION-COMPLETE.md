# Integração Completa do Formulário de Amostras com Zod

## Resumo da Implementação

O formulário multi-etapas de amostras foi completamente refatorado para utilizar o schema de validação Zod criado (`sample-schema.ts`). O componente `AddNewSample.tsx` agora funciona como o orquestrador principal que gerencia o estado e a navegação entre as três etapas do formulário.

## Arquitetura do Formulário

### 1. Componente Orquestrador: `AddNewSample.tsx`

**Responsabilidades:**
- Gerenciar o estado global do formulário (`formData`)
- Controlar a navegação entre as etapas (currentStepIndex)
- Validar os dados finais com o schema Zod antes da submissão
- Distribuir callbacks para os componentes filhos

**Estado Principal:**
```typescript
const [formData, setFormData] = useState<any>({
  collected_by: 'supplier',
  status: 'concluded',
  trusted: 'trusted',
  d18O_cel: [''],
  d18O_wood: [''],
  d15N_wood: [''],
  n_wood: [''],
  d13C_wood: [''],
  c_wood: [''],
  c_cel: [''],
  d13C_cel: [''],
  ...defaultValue,
})
```

**Handlers Principais:**

1. **handleSaveStepData**: Mescla os dados salvos de cada etapa no estado global
   ```typescript
   const handleSaveStepData = (data: any) => {
     setFormData((prev: any) => ({ ...prev, ...data }))
   }
   ```

2. **handleNextStep**: Navega para a próxima etapa
   ```typescript
   const handleNextStep = () => {
     if (currentStepIndex < STEPS.length - 1) {
       setCurrentStepIndex(currentStepIndex + 1)
     }
   }
   ```

3. **handlePreviousStep**: Volta para a etapa anterior
   ```typescript
   const handlePreviousStep = () => {
     if (currentStepIndex > 0) {
       setCurrentStepIndex(currentStepIndex - 1)
     }
   }
   ```

4. **handleChangeCollectedBy**: Alterna entre "Fornecedor" e "Minha Organização"
   ```typescript
   const handleChangeCollectedBy = (type: 'supplier' | 'my_org') => {
     setFormData((prev: any) => ({ ...prev, collected_by: type }))
   }
   ```

5. **handleFinalSubmit**: Valida com Zod e submete os dados
   ```typescript
   const handleFinalSubmit = () => {
     try {
       const validatedData = SampleCompleteSchema.parse(formData)
       onActionButtonClick(sampleId, validatedData as Partial<Sample>)
     } catch (error) {
       console.error('Erro de validação:', error)
       alert('Por favor, preencha todos os campos obrigatórios corretamente.')
     }
   }
   ```

### 2. Etapa 1: BasicInfoTab

**Campos (13 no total):**
- Nome da amostra (sample_name)
- Status
- Espécies (species)
- Origem (origin)
- Coletado por (collected_by): "supplier" | "my_org"
- Fornecedor/Organização (supplier/organization)
- Cidade (city)
- Estado (state)
- Município (municipality)
- Latitude (lat)
- Longitude (lon)
- Data de coleta (collection_date)
- Confiança (trusted): "trusted" | "untrusted" | "unknown"

**Props Recebidas:**
```typescript
interface BasicInfoTabProps {
  formData: Partial<Sample>
  onSave: (data: any) => void
  nextTab: () => void
  onChangeClickSupplier: (event: any) => void
  onChangeClickMyOrg: (event: any) => void
}
```

**Fluxo:**
1. Usuário preenche os campos básicos
2. Clica em "Próxima etapa"
3. `onSave` é chamado com os dados do formulário
4. `nextTab` é chamado para avançar para a etapa 2

### 3. Etapa 2: SampleMeasurementsTab

**Campos (15 no total):**
- Altura da medição (measureing_height)
- Diâmetro (diameter)
- Observações (observations)
- **8 campos isotópicos** (arrays dinâmicos):
  - d18O_cel
  - d18O_wood
  - d15N_wood
  - n_wood
  - d13C_wood
  - c_wood
  - c_cel
  - d13C_cel

**Props Recebidas:**
```typescript
interface SampleMeasurementsTabProps {
  formData: any
  onSave: (data: any) => void
  nextTab: () => void
  onCancelClick: () => void
}
```

**Fluxo:**
1. Usuário preenche medições e dados isotópicos
2. Pode adicionar/remover itens dos arrays isotópicos
3. Clica em "Próxima etapa"
4. `onSave` é chamado com os dados
5. `nextTab` avança para a revisão

### 4. Etapa 3: ReviewSample

**Funcionalidade:**
- Exibe todos os dados do formulário em modo somente leitura
- Organizado em abas: "Informações Gerais" e "Medições"
- Permite voltar para editar ou finalizar a submissão

**Props Recebidas:**
```typescript
interface ReviewAndSubmitTabProps {
  formData: any
  onNextClick: () => void
  onCancelClick: () => void
}
```

**Fluxo:**
1. Usuário revisa todos os dados
2. Pode clicar em "Cancelar" (`onCancelClick`) para voltar
3. Clica em "Finalizar" (`onNextClick`)
4. Dados são validados com Zod no `handleFinalSubmit`
5. Se válido, `onActionButtonClick` é chamado com os dados validados

## Validação Zod

### Schema Completo: `SampleCompleteSchema`

O schema valida todos os 28 campos do formulário:

```typescript
export const SampleCompleteSchema = z.object({
  // Campos básicos (13)
  sample_name: z.string().min(1, "Nome da amostra é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  trusted: z.string().min(1, "Confiança é obrigatória"),
  collected_by: z.enum(['supplier', 'my_org']),
  city: z.string().min(1, "Cidade é obrigatória"),
  
  // Campos isotópicos (8 arrays)
  d18O_cel: z.array(z.union([z.string(), z.number()])),
  d18O_wood: z.array(z.union([z.string(), z.number()])),
  // ... mais 6 campos isotópicos
  
  // Campos de medição (7)
  measureing_height: z.string().optional(),
  diameter: z.string().optional(),
  observations: z.string().optional(),
  // ...
}).refine((data) => {
  // Validações condicionais baseadas em collected_by
})
```

### Validação no Momento da Submissão

No `handleFinalSubmit`, o schema é usado para validar:

```typescript
try {
  const validatedData = SampleCompleteSchema.parse(formData)
  // Se passou, dados estão válidos
  onActionButtonClick(sampleId, validatedData as Partial<Sample>)
} catch (error) {
  // Se falhou, mostra erro
  console.error('Erro de validação:', error)
  alert('Por favor, preencha todos os campos obrigatórios corretamente.')
}
```

## Fluxo Completo do Usuário

1. **Início**: Usuário acessa a página de adicionar amostra
2. **Etapa 1 - Informações Básicas**:
   - Alterna entre "Fornecedor" e "Minha Organização"
   - Preenche dados básicos (nome, espécie, localização, etc.)
   - Clica em "Próxima etapa"
   - Dados são salvos em `formData` via `handleSaveStepData`

3. **Etapa 2 - Medições**:
   - Preenche altura, diâmetro, observações
   - Adiciona dados isotópicos (pode ter múltiplos valores por tipo)
   - Clica em "Próxima etapa"
   - Dados são mesclados com `formData` existente

4. **Etapa 3 - Revisão**:
   - Visualiza todos os dados em modo somente leitura
   - Pode voltar para editar qualquer etapa
   - Clica em "Finalizar"
   - Zod valida os dados completos
   - Se válido, dados são enviados para Firebase
   - QR code é gerado
   - Usuário é redirecionado

## Integração com Firebase

O componente pai (`add-sample/page.tsx`) passa a função `onActionButtonClick`:

```typescript
const onCreateSampleClick = async (id: string, data: Partial<Sample>) => {
  // Gera QR code
  const qrCodeDataURL = await generateQRCode(id)
  
  // Salva no Firestore
  await addDoc(collection(db, collectionName), {
    ...data,
    qr_code: qrCodeDataURL,
    created_at: serverTimestamp(),
    // ... outros campos
  })
  
  // Redireciona
  router.push('/samples')
}
```

## Benefícios da Nova Arquitetura

1. **Validação Centralizada**: Um único schema Zod valida todos os campos
2. **Estado Global**: `formData` é compartilhado entre todas as etapas
3. **Navegação Controlada**: Usuário pode avançar/voltar sem perder dados
4. **Type Safety**: TypeScript + Zod garantem tipagem forte
5. **Separação de Responsabilidades**: Cada componente tem função clara
6. **Validação no Submit**: Dados só são enviados se passarem na validação Zod
7. **Experiência do Usuário**: Formulário multi-etapas reduz sobrecarga cognitiva
8. **Manutenibilidade**: Fácil adicionar novos campos ou etapas

## Próximos Passos (Opcional)

1. **Validação em Tempo Real**: Adicionar validação Zod em cada etapa (não só no final)
2. **Indicadores de Progresso**: Mostrar quais campos foram preenchidos
3. **Salvar Rascunho**: Permitir salvar formulário incompleto
4. **Validação Visual**: Destacar campos com erro em vermelho
5. **Toast Notifications**: Usar toast em vez de `alert()` para erros
6. **Loading States**: Adicionar spinners durante validação/submissão
7. **Testes**: Adicionar testes unitários para validação Zod

## Arquivos Modificados

- ✅ `AddNewSample.tsx` - Orquestrador principal refatorado
- ✅ `sample-schema.ts` - Schema Zod completo criado
- ✅ `sample-schema-complete.md` - Documentação dos campos
- ✅ `BasicInfoTab.tsx` - Etapa 1 refatorada (anteriormente)
- ✅ `SampleMeasurementTab.tsx` - Etapa 2 refatorada (anteriormente)
- ✅ `ReviewSample.tsx` - Etapa 3 refatorada (anteriormente)

## Conclusão

O formulário de amostras agora está totalmente funcional com validação Zod integrada. O fluxo multi-etapas permite uma experiência de usuário melhorada, enquanto a validação centralizada garante integridade dos dados antes da submissão ao Firebase.
