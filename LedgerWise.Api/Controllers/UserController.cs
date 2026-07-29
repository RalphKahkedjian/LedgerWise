using LedgerWise.Api.Data;
using LedgerWise.Api.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LedgerWise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController :ControllerBase
{
  private readonly AppDbContext _context;
  public UserController(AppDbContext context)
  {
    _context = context;
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetUser(int id)
  {
    var user = await _context.Users
      .Where(u => u.Id == id)
      .Select(u => new UserLookupResponse
      {
        Id = id,
        Name = u.Name,
        Email = u.Email
      })
      .FirstOrDefaultAsync();

      if (user == null)
          return NotFound();

      return Ok(user);
  }
}