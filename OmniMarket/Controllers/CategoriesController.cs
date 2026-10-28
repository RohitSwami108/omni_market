using MediatR;
using Microsoft.AspNetCore.Mvc;
using OmniMarket.Application.Categories.Commands;
using OmniMarket.Application.Categories.Queries;

namespace OmniMarket.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : Controller {
    private readonly ISender _mediator;
    public CategoriesController(ISender mediator) {
        _mediator = mediator;
    }
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> getAll(CancellationToken cancellationToken) {
        var categories = await _mediator.Send(new GetCategoriesQuery(), cancellationToken);
        return Ok(categories);
    }
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateCategoryCommand command,CancellationToken cancellationToken) {
        var categoryId = await _mediator.Send(command, cancellationToken);
        return Ok(categoryId);
    }
}
