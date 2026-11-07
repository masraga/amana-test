<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;

class AuthService
{
    public function __construct(private readonly UserRepositoryInterface $userRepository) {}

    /**
     * @param array<string, mixed> $data
     * @return array{token: string, user: User}
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(array $data): array
    {
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'reporter',
        ]);

        $token = auth()->login($user);

        return ['token' => $token, 'user' => $user];
    }

    /**
     * @param array<string, mixed> $credentials
     * @return array{token: string, user: User}
     * @throws AuthenticationException
     */
    public function login(array $credentials): array
    {
        $token = auth()->attempt($credentials);

        if (!$token) {
            throw new AuthenticationException('Invalid credentials.');
        }

        return ['token' => $token, 'user' => auth()->user()];
    }

    public function logout(): void
    {
        auth()->logout();
    }

    public function me(): User
    {
        return auth()->user();
    }
}
