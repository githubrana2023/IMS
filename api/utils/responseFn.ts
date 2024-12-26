type SuccessResponseWithMeta<T> = {
    success: true;
    message: string;
    data: T,
    meta: {
        page: number;
        limit: number;
        total: number
    }
}
type SuccessResponse<T> = {
    success: true;
    message: string;
    data: T;
}

type ErrorResponse = {
    success: false;
    message: string;
    error: unknown
}

type ApiResponse<T, TData> = T extends true ? SuccessResponse<TData> : ErrorResponse

type Payload<T, TData = unknown> = T extends true ? { data: TData } : { error: unknown }

const apiResponse = <T extends boolean, TData>(success: T, payload: Payload<T, TData>, message: string) => {
    if (success) {
        return {
            success,
            message,
            data: (payload as {data:TData}).data
        }
    }
    return {
        success,
        message,
        error:(payload as {error:unknown}).error
    }
}

const responseObj = apiResponse(true, { data:[{name:"hello"}] },'')
apiResponse(false, { error: "" },'')
