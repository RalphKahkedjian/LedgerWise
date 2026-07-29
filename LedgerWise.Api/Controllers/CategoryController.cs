using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedgerWise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoryController : ControllerBase
{
  private readonly ICategoryService _categoryService;
  public CategoryController(ICategoryService categoryService)
  {
    _categoryService = categoryService;
  }

  [HttpPost]
  public async Task<IActionResult> Create(CategoryRequest request)
  {
    var result = await _categoryService.CreateAsync(User, request);

    if (!result.Success)
        return BadRequest(result.Message);
      
    return Ok(result.Data);
  }

  [HttpGet]
  public async Task<IActionResult> GetAll()
  {
    var result = await _categoryService.GetAllAsync(User);

    return Ok(result.Data);
  }
}