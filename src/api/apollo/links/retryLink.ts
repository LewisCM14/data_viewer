import { RetryLink } from "@apollo/client/link/retry";

export const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, operation) =>
      !!error &&
      !operation.getContext().userSignal?.aborted &&
      error.name !== "AbortError",
  },
});
