package com.pinvault.collection;

import com.pinvault.pin.PinDtos.PinResponse;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public final class CollectionDtos {

    private CollectionDtos() {
    }

    public record AddItemRequest(
            @NotNull Long pinId,
            @NotNull CollectionStatus status,
            @Min(1) @Max(999) Integer quantity,
            @Size(max = 500) String note,
            @Size(max = 500) String defect,
            Boolean backingCard,
            @DecimalMin("0.0") @Digits(integer = 8, fraction = 2) BigDecimal manualPrice) {
    }

    public record UpdateItemRequest(
            @NotNull @Min(1) @Max(999) Integer quantity,
            @Size(max = 500) String note,
            @Size(max = 500) String defect,
            Boolean backingCard,
            @DecimalMin("0.0") @Digits(integer = 8, fraction = 2) BigDecimal manualPrice) {
    }

    public record CollectionItemResponse(
            Long id, PinResponse pin, CollectionStatus status, int quantity, String note,
            String defect, Boolean backingCard, BigDecimal manualPrice, BigDecimal totalPrice, Instant addedAt) {
    }
}
