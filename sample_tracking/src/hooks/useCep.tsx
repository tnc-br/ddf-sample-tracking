import { AxiosError } from "axios";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

type retryInviteUserBody = {
  cep: string;
};

type getCepOptions = UseMutationOptions<
  any, // oq retorna
  AxiosError<any>,
  retryInviteUserBody,
  unknown
>;

export const useCep = (options?: getCepOptions) => {
  return useMutation({
    ...options,
    mutationFn: async (body: retryInviteUserBody) => {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${body.cep}/json/`
      );

      return data;
    },
  });
};
