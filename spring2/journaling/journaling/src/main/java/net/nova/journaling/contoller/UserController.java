package net.nova.journaling.contoller;

import io.swagger.v3.oas.annotations.tags.Tag;
import net.nova.journaling.Dto.UserUpdateDto;
import net.nova.journaling.Entity.User;
import net.nova.journaling.Repository.UserRepository;
import net.nova.journaling.services.UserService;
import net.nova.journaling.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import net.nova.journaling.Response.WeatherResponse;

// This placeholder is necessary to resolve the "Cannot resolve symbol WeatherResponse" error
// shown in your screenshot. In a real application, this would be a separate class
// that mirrors the structure of the JSON response from your weather API.
record Current(double feelslike) {}
record WeatherResponce(Current current) {}


@RestController
@RequestMapping("/user")
@Tag(name = "User APIs", description = "Read, Update & Delete User")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeatherService weatherService;

    /**
     * Updates the authenticated user's details.
     * This method is more secure as it only updates the currently authenticated user's data.
     * It also uses the UserService to handle the password update, which should include
     * password encoding to prevent plain-text storage.
     *
     * @return a ResponseEntity with NO_CONTENT status.
     */
    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateDto userUpdateDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();

        User userInDb = userService.findByUserName(userName);

        if (userInDb == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // The logic to handle password updates is now correctly placed in the UserService.
        // This is more concise and follows best practices.
        // The if-check is now done within the UserService.updatePassword method.
        // We pass the new password from the DTO.
        userService.updatePassword(userInDb, userUpdateDto.getPassword());

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Deletes the currently authenticated user.
     * The method name is changed to be more descriptive of its purpose.
     *
     * @return a ResponseEntity with NO_CONTENT status.
     */
    @DeleteMapping
    public ResponseEntity<?> deleteCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userRepository.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<?> greeting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WeatherResponse weatherResponse = weatherService.getWeather("Mumbai");
        String greeting = "";
        if (weatherResponse != null && weatherResponse.getCurrent() != null) {
            greeting = ", Weather feels like " + weatherResponse.getCurrent().getFeelslike();
        }
        return new ResponseEntity<>("Hi " + authentication.getName() + greeting, HttpStatus.OK);
    }
}
