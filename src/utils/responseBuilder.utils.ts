export interface Response {
  code: string;
  message: string;
  data: any;
}

export function createResponse({
  statusCode,
  message = 'Rates Parsed Successfully.',
  data,
}: {
  statusCode: number;
  message?: string;
  data?: any;
}): Response {
  return {
    message,
    code: `FXQL-${statusCode}`,
    data,
  };
}
