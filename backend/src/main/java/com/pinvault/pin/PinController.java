package com.pinvault.pin;

import com.pinvault.common.PageResponse;
import com.pinvault.pin.PinDtos.PinDetailResponse;
import com.pinvault.pin.PinDtos.PinRequest;
import com.pinvault.pin.PinDtos.PinResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pins")
public class PinController {

    private static final int MAX_PAGE_SIZE = 100;

    private final PinService pinService;

    public PinController(PinService pinService) {
        this.pinService = pinService;
    }

    @GetMapping
    public PageResponse<PinResponse> search(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) Park park,
                                            @RequestParam(required = false) Edition edition,
                                            @RequestParam(required = false) Integer year,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "24") int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return pinService.search(q, park, edition, year, pageable);
    }

    @GetMapping("/{id}")
    public PinDetailResponse get(@PathVariable Long id) {
        return pinService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PinResponse create(@Valid @RequestBody PinRequest req, @AuthenticationPrincipal UserDetails user) {
        return pinService.create(req, user.getUsername());
    }

    @PutMapping("/{id}")
    public PinResponse update(@PathVariable Long id, @Valid @RequestBody PinRequest req,
                              @AuthenticationPrincipal UserDetails user) {
        return pinService.update(id, req, user.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        pinService.delete(id, user.getUsername());
    }
}
