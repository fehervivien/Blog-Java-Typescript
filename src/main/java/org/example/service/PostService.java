package org.example.service;

import org.example.model.CreatePostRequest;
import org.example.model.Post;
import org.example.repository.PostRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;



@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post createPost(CreatePostRequest req) {
        Post post = new Post(
                req.title(),
                req.content(),
                req.author() == null || req.author().isBlank() ? "Névtelen" : req.author(),
                LocalDateTime.now()
        );
        return postRepository.save(post);
    }

    public boolean deletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Post> updatePost(Long id, CreatePostRequest req) {
        return postRepository.findById(id).map(existingPost -> {
            existingPost.setTitle(req.title());
            existingPost.setContent(req.content());
            if (req.author() != null && !req.author().isBlank()) {
                existingPost.setAuthor(req.author());
            }
            return postRepository.save(existingPost);
        });
    }
}