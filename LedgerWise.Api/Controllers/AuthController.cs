using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.DTOs.Responses;
using LedgerWise.Api.Data;
using LedgerWise.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace LedgerWise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly AppDbContext _context;
  public AuthController(AppDbContext context)
  {
    _context = context;
  }

  private string GenerateToken(User user)
  {
    var claims = new[]
    {
      new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new Claim(ClaimTypes.Name, user.Name),
      new Claim(ClaimTypes.Email, user.Email)
    };

    var key = new SymmetricSecurityKey(
      Encoding.UTF8.GetBytes(HttpContext.RequestServices
        .GetRequiredService<IConfiguration>()["Jwt:Key"]!
      )
    );

    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
      issuer: HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:Issuer"],
        audience: HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddHours(2),
        signingCredentials: credentials);
      return new JwtSecurityTokenHandler().WriteToken(token);
  }

  [HttpPost("register")]
  public async Task<IActionResult> Register (RegisterRequest request)
  {
    if (await _context.Users.AnyAsync(u => u.Email == request.Email))
    {
      return BadRequest("Email Already Exists");
    }

    var user = new User
    {
      Name = request.Name,
      Email = request.Email,
      PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    Console.WriteLine($"New user: {user.Id}");

    var wallet = new Wallet
    {
      UserId = user.Id,
      Balance = 0
    };

    _context.Wallets.Add(wallet);
    await _context.SaveChangesAsync();

    return Ok($"Welcome {user.Name} to LedgerWise");
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login (LoginRequest request)
  {
    var user = await _context.Users
      .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user == null)
        return Unauthorized("Invalid email or password");

    bool isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

    if (!isValidPassword)
        return Unauthorized("Invalid email or password");

    var token = GenerateToken(user);

    return Ok(new LoginResponse
    {
      Token = token
    });
  }
}