package com.pinvault.pokemon;

import com.pinvault.collection.CollectionStatus;
import com.pinvault.user.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/** Une carte Pokémon dans la collection d'un membre, avec son état, sa variante et son éventuelle gradation. */
@Entity
@Table(name = "card_collection_item")
public class CardCollectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id")
    private PokemonCard card;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollectionStatus status;

    @Column(nullable = false)
    private int quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_condition", nullable = false, length = 20)
    private CardCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardVariant variant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private CardLanguage language;

    @Enumerated(EnumType.STRING)
    @Column(name = "grading_company", length = 20)
    private GradingCompany gradingCompany;

    @Column(precision = 3, scale = 1)
    private BigDecimal grade;

    @Column(length = 500)
    private String note;

    /** Prix saisi par le membre : remplace l'estimation automatique s'il est renseigné. */
    @Column(name = "manual_price", precision = 10, scale = 2)
    private BigDecimal manualPrice;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    protected CardCollectionItem() {
    }

    public CardCollectionItem(AppUser user, PokemonCard card) {
        this.user = user;
        this.card = card;
    }

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public PokemonCard getCard() { return card; }
    public CollectionStatus getStatus() { return status; }
    public int getQuantity() { return quantity; }
    public CardCondition getCondition() { return condition; }
    public CardVariant getVariant() { return variant; }
    public CardLanguage getLanguage() { return language; }
    public GradingCompany getGradingCompany() { return gradingCompany; }
    public BigDecimal getGrade() { return grade; }
    public String getNote() { return note; }
    public BigDecimal getManualPrice() { return manualPrice; }
    public Instant getAddedAt() { return addedAt; }

    public void setStatus(CollectionStatus status) { this.status = status; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public void setCondition(CardCondition condition) { this.condition = condition; }
    public void setVariant(CardVariant variant) { this.variant = variant; }
    public void setLanguage(CardLanguage language) { this.language = language; }
    public void setGradingCompany(GradingCompany gradingCompany) { this.gradingCompany = gradingCompany; }
    public void setGrade(BigDecimal grade) { this.grade = grade; }
    public void setNote(String note) { this.note = note; }
    public void setManualPrice(BigDecimal manualPrice) { this.manualPrice = manualPrice; }
}
