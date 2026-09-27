package com.pinvault.collection;

import com.pinvault.pin.Pin;
import com.pinvault.user.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "collection_item",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "pin_id", "status"}))
public class CollectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pin_id")
    private Pin pin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollectionStatus status;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(length = 500)
    private String note;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    protected CollectionItem() {
    }

    public CollectionItem(AppUser user, Pin pin, CollectionStatus status, int quantity, String note) {
        this.user = user;
        this.pin = pin;
        this.status = status;
        this.quantity = quantity;
        this.note = note;
    }

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public Pin getPin() { return pin; }
    public CollectionStatus getStatus() { return status; }
    public int getQuantity() { return quantity; }
    public String getNote() { return note; }
    public Instant getAddedAt() { return addedAt; }

    public void setQuantity(int quantity) { this.quantity = quantity; }
    public void setNote(String note) { this.note = note; }
}
