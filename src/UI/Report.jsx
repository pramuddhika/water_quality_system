import Button from 'react-bootstrap/Button';

const Reports = () => {
    return (
        <div>
            <div className="w-col-10 flex flex-row items-center gap-4">
                <p>Download CSV file by</p>
            <Button variant="primary" className='ml-20 mt-4'>Device wise</Button>
            <Button variant="warning" className='mr-20 mt-4'>Client wise</Button>
            </div>
        </div>
    );
}

export default Reports;