import { AxiosError } from 'axios'
import { UseMutationOptions, useMutation } from '@tanstack/react-query'
import axios from 'axios'

type CepResponse = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface CepRequestBody {
  cep: string
}

type FetchCepOptions = UseMutationOptions<
  CepResponse,
  AxiosError<any>,
  CepRequestBody,
  unknown
>

export const useCep = (options?: FetchCepOptions) => {
  return useMutation({
    ...options,
    mutationFn: async (body: CepRequestBody) => {
      const { data } = await axios.get<CepResponse>(
        `https://viacep.com.br/ws/${body.cep}/json/`,
      )

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      return data
    },
  })
}
