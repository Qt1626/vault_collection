package com.pinvault.pokemon;

import com.pinvault.collection.CollectionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardCollectionItemRepository extends JpaRepository<CardCollectionItem, Long> {

    @EntityGraph(attributePaths = {"card", "user"})
    List<CardCollectionItem> findByUserUsernameIgnoreCaseOrderByAddedAtDesc(String username);

    @EntityGraph(attributePaths = {"card", "user"})
    List<CardCollectionItem> findByUserUsernameIgnoreCaseAndStatusOrderByAddedAtDesc(String username,
                                                                                    CollectionStatus status);
}
