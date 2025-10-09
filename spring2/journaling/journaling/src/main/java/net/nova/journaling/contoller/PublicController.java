package net.nova.journaling.contoller;

import net.nova.journaling.Entity.User;
import net.nova.journaling.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*") 
public class PublicController {

    @Autowired
    private UserService userService;

    @GetMapping("/health-check")
    public String healthCheck() {
        return "OK";
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            boolean saved = userService.saveNewUser(user);
            if (saved) {
                return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Username already exists", HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

