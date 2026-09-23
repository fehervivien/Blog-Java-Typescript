package org.example.config;


import org.example.model.Post;
import org.example.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;


@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(PostRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Post(
                        "Üdvözöllek a JPA alapú Blogomon!",
                        "Ez a bejegyzés már egy valódi H2 memóriabeli relációs SQL táblából érkezik.",
                        "Fehér",
                        LocalDateTime.now()
                ));
            }
        };
    }
}
