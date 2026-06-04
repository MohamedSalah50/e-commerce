export class GetAllResponse<T = any> {
    result: {
        doc_count?: number, pages?: number
        , current_page?: number | undefined,
        limit?: number, result: T[]
    }
}