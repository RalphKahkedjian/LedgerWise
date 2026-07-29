using LedgerWise.Api.Common;
using LedgerWise.Api.Data;
using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.DTOs.Responses;
using LedgerWise.Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LedgerWise.Api.Services;

public class CategoryService : ICategoryService
{
  private readonly AppDbContext _context;

  public CategoryService(AppDbContext context)
  {
    _context = context;
  }

  public async Task<ServiceResult<CategoryResponse>> CreateAsync(
    ClaimsPrincipal user,
    CategoryRequest request
  )
  {
    if (string.IsNullOrWhiteSpace(request.Name))
        return ServiceResult<CategoryResponse>.Fail("Category name is required");

    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var exists = await _context.Categories.AnyAsync(c => 
      c.UserId == userId &&
      c.Name.ToLower() == request.Name.ToLower()
    );

    if (exists)
        return ServiceResult<CategoryResponse>.Fail("Category Already Exists");

    var category = new Category
    {
      Name = request.Name,
      UserId = userId
    };

    _context.Categories.Add(category);

    await _context.SaveChangesAsync();

    return ServiceResult<CategoryResponse>.Ok(
      new CategoryResponse
      {
        Id = category.Id,
        Name = category.Name
      }
    );
  }

  public async Task<ServiceResult<List<CategoryResponse>>> GetAllAsync(ClaimsPrincipal user)
  {
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var Categories = await _context.Categories
                      .Where(c => c.UserId == userId)
                      .Select (c => new CategoryResponse
                      {
                        Id = c.Id,
                        Name = c.Name
                      })
                      .ToListAsync();

    return ServiceResult<List<CategoryResponse>>.Ok(Categories);
  }
}