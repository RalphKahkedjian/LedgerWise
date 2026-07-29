using LedgerWise.Api.Common;
using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.DTOs.Responses;
using System.Security.Claims;

namespace LedgerWise.Api.Services;

public interface ICategoryService
{
  Task<ServiceResult<CategoryResponse>> CreateAsync(
    ClaimsPrincipal user,
    CategoryRequest request
  );

  Task<ServiceResult<List<CategoryResponse>>> GetAllAsync(
    ClaimsPrincipal user
  );
}