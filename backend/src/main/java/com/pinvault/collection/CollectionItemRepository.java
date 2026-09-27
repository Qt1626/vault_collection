package com.pinvault.collection;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long> {

    @EntityGraph(attributePaths = {"pin", "pin.createdBy"})
    List<CollectionItem> findByUserUsernameIgnoreCaseOrderByAddedAtDesc(String username);

    @EntityGraph(attributePaths = {"pin", "pin.createdBy"})
    List<CollectionItem> findByUserUsernameIgnoreCaseAndStatusOrderByAddedAtDesc(String username, CollectionStatus status);

    Optional<CollectionItem> findByUserIdAndPinIdAndStatus(Long userId, Long pinId, CollectionStatus status);

    @Query("select count(distinct c.user.id) from CollectionItem c where c.pin.id = :pinId and c.status = :status")
    long countDistinctUsersByPinAndStatus(@Param("pinId") Long pinId, @Param("status") CollectionStatus status);
}
