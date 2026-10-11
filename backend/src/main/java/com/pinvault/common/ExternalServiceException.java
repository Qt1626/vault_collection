package com.pinvault.common;

/** Un service externe (ex. API TCGdex) est indisponible ou a répondu une erreur. */
public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
