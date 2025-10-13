package net.nova.journaling.contoller;

import net.nova.journaling.Entity.User;
import net.nova.journaling.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*") 
public class PublicController {

   private static final Logger logger = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/health-check")
    public String healthCheck() {
         logger.info("--- Endpoint /public/health-check called. ---");
        return "OK";
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User user) {
         logger.info("--- Endpoint /public/create-user called for user: {} ---", user.getUserName());
        try {
            boolean saved = userService.saveNewUser(user);
            if (saved) {
                 logger.info("User {} created successfully.", user.getUserName());
                return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
            } else {
                logger.warn("User creation failed: Username {} already exists.", user.getUserName());
                return new ResponseEntity<>("Username already exists", HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error creating user {}: {}", user.getUserName(), e.getMessage(), e);
            return new ResponseEntity<>("Error creating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


