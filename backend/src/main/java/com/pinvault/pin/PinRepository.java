package com.pinvault.pin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PinRepository extends JpaRepository<Pin, Long>, JpaSpecificationExecutor<Pin> {
}
