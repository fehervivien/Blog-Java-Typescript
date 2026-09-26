package org.example.service;


import org.example.model.CreatePostRequest;
import org.example.model.Post;
import org.example.model.User;
import org.example.repository.PostRepository;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;



@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post createPost(CreatePostRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new SecurityException("Csak regisztrált felhasználó hozhat létre bejegyzést!"));

        Post post = new Post(
                req.title(),
                req.content(),
                user.getDisplayName(),
                LocalDateTime.now()
        );
        return postRepository.save(post);
    }

    public Post updatePost(Long id, CreatePostRequest req, String username) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("A bejegyzés nem található!"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new SecurityException("Nincs jogosultságod: regisztráció szükséges!"));

        // Ellenőrzés: a szerkesztő azonos-e a cikk szerzőjével
        if (!existing.getAuthor().equals(user.getDisplayName()) && !existing.getAuthor().equals(user.getUsername())) {
            throw new SecurityException("Csak a saját bejegyzésedet szerkesztheted!");
        }

        existing.setTitle(req.title());
        existing.setContent(req.content());
        return postRepository.save(existing);
    }

    public void deletePost(Long id, String username) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("A bejegyzés nem található!"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new SecurityException("Nincs jogosultságod: regisztráció szükséges!"));

        // Ellenőrzés: a törlő azonos-e a cikk szerzőjével
        if (!existing.getAuthor().equals(user.getDisplayName()) && !existing.getAuthor().equals(user.getUsername())) {
            throw new SecurityException("Csak a saját bejegyzésedet törölheted!");
        }

        postRepository.deleteById(id);
    }
}