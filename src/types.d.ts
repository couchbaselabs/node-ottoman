/* istanbul ignore file */
declare module 'couchbase' {
  export class CouchbaseError extends Error {
    cause: any;
    context: any;
    name = this.constructor.name;
    constructor(errtext?, baseerr?, context?, ...args);
  }
  export class TimeoutError extends CouchbaseError {}
  export class RequestCanceledError extends CouchbaseError {}
  export class InvalidArgumentError extends CouchbaseError {}
  export class ServiceNotAvailableError extends CouchbaseError {}
  export class InternalServerFailureError extends CouchbaseError {}
  export class AuthenticationFailureError extends CouchbaseError {}
  export class TemporaryFailureError extends CouchbaseError {}
  export class ParsingFailureError extends CouchbaseError {}
  export class CasMismatchError extends CouchbaseError {}
  export class BucketNotFoundError extends CouchbaseError {}
  export class CollectionNotFoundError extends CouchbaseError {}
  export class EncodingFailureError extends CouchbaseError {}
  export class DecodingFailureError extends CouchbaseError {}
  export class UnsupportedOperationError extends CouchbaseError {}
  export class AmbiguousTimeoutError extends CouchbaseError {}
  export class UnambiguousTimeoutError extends CouchbaseError {}
  export class FeatureNotAvailableError extends CouchbaseError {}
  export class ScopeNotFoundError extends CouchbaseError {
    constructor(baseerr);
  }
  export class IndexNotFoundError extends CouchbaseError {}
  export class IndexExistsError extends CouchbaseError {}
  export class DocumentNotFoundError extends CouchbaseError {}
  export class DocumentUnretrievableError extends CouchbaseError {}
  export class DocumentLockedError extends CouchbaseError {}
  export class ValueTooLargeError extends CouchbaseError {}
  export class DocumentExistsError extends CouchbaseError {}
  export class ValueNotJsonError extends CouchbaseError {}
  export class DurabilityLevelNotAvailableError extends CouchbaseError {}
  export class DurabilityImpossibleError extends CouchbaseError {}
  export class DurabilityAmbiguousError extends CouchbaseError {}
  export class DurableWriteInProgressError extends CouchbaseError {}
  export class DurableWriteReCommitInProgressError extends CouchbaseError {}
  export class MutationLostError extends CouchbaseError {}
  export class PathNotFoundError extends CouchbaseError {}
  export class PathMismatchError extends CouchbaseError {}
  export class PathInvalidError extends CouchbaseError {}
  export class PathTooBigError extends CouchbaseError {}
  export class PathTooDeepError extends CouchbaseError {}
  export class ValueTooDeepError extends CouchbaseError {}
  export class ValueInvalidError extends CouchbaseError {}
  export class DocumentNotJsonError extends CouchbaseError {}
  export class NumberTooBigError extends CouchbaseError {}
  export class DeltaInvalidError extends CouchbaseError {}
  export class PathExistsError extends CouchbaseError {}
  export class PlanningFailureError extends CouchbaseError {}
  export class IndexFailureError extends CouchbaseError {}
  export class PreparedStatementFailure extends CouchbaseError {}
  export class CompilationFailureError extends CouchbaseError {}
  export class JobQueueFullError extends CouchbaseError {}
  export class DatasetNotFoundError extends CouchbaseError {}
  export class DataverseNotFoundError extends CouchbaseError {}
  export class DatasetExistsError extends CouchbaseError {}
  export class DataverseExistsError extends CouchbaseError {}
  export class LinkNotFoundError extends CouchbaseError {}
  export class ViewNotFoundError extends CouchbaseError {}
  export class DesignDocumentNotFoundError extends CouchbaseError {}
  export class CollectionExistsError extends CouchbaseError {}
  export class ScopeExistsError extends CouchbaseError {}
  export class UserNotFoundError extends CouchbaseError {}
  export class GroupNotFoundError extends CouchbaseError {}
  export class BucketExistsError extends CouchbaseError {}
  export class UserExistsError extends CouchbaseError {}
  export class BucketNotFlushableError extends CouchbaseError {}
  export class KeyValueErrorContext {
    public status_code: number;
    public opaque: number;
    public cas: number;
    public key: string;
    public bucket: string;
    public collection: string;
    public scope: string;
    public context: string;
    public ref: string;
  }
  export class ViewErrorContext extends CouchbaseError {
    public first_error_code: number;
    public first_error_message: string;
    public design_document: string;
    public view: string;
    public parameters;
    public http_response_code: number;
    public http_response_body: string;
  }
  export class QueryErrorContext extends CouchbaseError {
    public first_error_code: number;
    public first_error_message: string;
    public statement: string;
    public client_context_id: string;
    public parameters;
    public http_response_code: number;
    public http_response_body: string;
  }
  export class SearchErrorContext extends CouchbaseError {
    public error_message: string;
    public index_name: string;
    public query;
    public parameters;
    public http_response_code: number;
    public http_response_body: string;
  }
  export class AnalyticsErrorContext extends CouchbaseError {
    public first_error_code: number;
    public first_error_message: string;
    public statement: string;
    public client_context_id: string;
    public http_response_code: number;
    public http_response_body: string;
  }
}
