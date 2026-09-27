package com.pinvault.pin;

import com.pinvault.user.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "pin")
public class Pin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "character_name", length = 100)
    private String characterName;

    @Column(length = 150)
    private String series;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Park park;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Edition edition;

    @Column(name = "edition_size")
    private Integer editionSize;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Pin() {
    }

    public Pin(AppUser createdBy) {
        this.createdBy = createdBy;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCharacterName() { return characterName; }
    public String getSeries() { return series; }
    public Park getPark() { return park; }
    public Edition getEdition() { return edition; }
    public Integer getEditionSize() { return editionSize; }
    public Integer getReleaseYear() { return releaseYear; }
    public String getImageUrl() { return imageUrl; }
    public AppUser getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setCharacterName(String characterName) { this.characterName = characterName; }
    public void setSeries(String series) { this.series = series; }
    public void setPark(Park park) { this.park = park; }
    public void setEdition(Edition edition) { this.edition = edition; }
    public void setEditionSize(Integer editionSize) { this.editionSize = editionSize; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
