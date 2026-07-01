import asyncio
from datetime import date, timedelta
from app.services.travel_request_service import TravelRequestService
from app.schemas.travel_request import TravelRequestCreate, TripType, BudgetRange
from app.core.database import get_database
from app.repositories.travel_request_repository import TravelRequestRepository

async def main():
    db = await get_database()
    repo = TravelRequestRepository(db)
    service = TravelRequestService(repo)
    
    travel_date = date.today() + timedelta(days=3)
    data = TravelRequestCreate(
        destination_city="Chennai",
        travel_date=travel_date,
        trip_type=TripType.VACATION,
        budget_range=BudgetRange.MEDIUM,
        special_needs=False
    )
    
    model = await service.create(data)
    
    # Let's inspect the database
    doc = await db["travel_requests"].find_one({"_id": repo._to_object_id(model.id)})
    import json
    # Use default=str for serialization of dates/ObejctIds
    print(json.dumps(doc.get("weather", {}), indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
