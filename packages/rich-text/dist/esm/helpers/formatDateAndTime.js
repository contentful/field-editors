import moment from 'moment';
export const formatDate = (date, short)=>{
    switch(moment().startOf('day').diff(moment(date).startOf('day'), 'days')){
        case 0:
            return short ? 'Today' : `Today, ${moment(date).format('DD MMM YYYY')}`;
        case -1:
            return short ? 'Tomorrow' : `Tomorrow, ${moment(date).format('DD MMM YYYY')}`;
        case 1:
            return short ? 'Yesterday' : `Yesterday, ${moment(date).format('DD MMM YYYY')}`;
        default:
            return moment(date).format('ddd, DD MMM YYYY');
    }
};
export const formatTime = (date)=>{
    return moment.utc(date).local().format('h:mm A');
};
export const formatDateAndTime = (date, short)=>{
    return `${formatDate(date, short)} at ${formatTime(date)}`;
};
