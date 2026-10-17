package com.pinvault.collection;

import com.pinvault.pin.PinDtos.PinResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
            Boolean backingCard) {
    }

    public record UpdateItemRequest(
            @NotNull @Min(1) @Max(999) Integer quantity,
            @Size(max = 500) String note,
            @Size(max = 500) String defect,
            Boolean backingCard) {
    }

    public record CollectionItemResponse(
            Long id, PinResponse pin, CollectionStatus status, int quantity, String note,
            String defect, Boolean backingCard, Instant addedAt) {
    }
}
