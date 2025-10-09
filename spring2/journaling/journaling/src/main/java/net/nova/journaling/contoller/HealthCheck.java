package net.nova.journaling.contoller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@CrossOrigin(origins = "*") 
public class HealthCheck {

    // special type of components
    @GetMapping("/health-check")
    public String HeathCheck(){
        return"ok";
    }
}

