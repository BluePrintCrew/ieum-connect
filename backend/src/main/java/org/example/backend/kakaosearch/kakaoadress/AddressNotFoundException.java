package org.example.backend.kakaosearch.kakaoadress;

public class AddressNotFoundException extends RuntimeException {
    public AddressNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
